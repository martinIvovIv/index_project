import { readFile } from "fs/promises";
import path from "path";
import { config } from "../config/config";
import { createPool, pool } from "./pool";

async function ensureDatabaseExists() {
  const adminPool = createPool({ database: "postgres" });

  try {
    const result = await adminPool.query<{ exists: boolean }>(
      `
        SELECT EXISTS (
          SELECT 1
          FROM pg_database
          WHERE datname = $1
        ) AS "exists"
      `,
      [config.DB_NAME],
    );

    if (!result.rows[0]?.exists) {
      await adminPool.query(`CREATE DATABASE "${config.DB_NAME}"`);
      console.log(`Created database ${config.DB_NAME}.`);
    }
  } finally {
    await adminPool.end();
  }
}

async function setupDatabase() {
  await ensureDatabaseExists();

  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = await readFile(schemaPath, "utf8");

  await pool.query(sql);
  await pool.end();

  console.log("Database schema is ready.");
}

setupDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
