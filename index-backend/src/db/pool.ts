import { Pool } from "pg";
import { config } from "../config/config";

type PoolOptions = {
  database?: string;
};

export function createPool() {
  return new Pool({
    host: config.DB_HOST,
    port: config.DB_PORT,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_NAME,
  });
}

export const pool = createPool();
