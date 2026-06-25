import { createApp } from "./app";
import { config } from "./config/config";
import { pool } from "./db/pool";
import { writeOpenApiDocument } from "./openapi/writeOpenApi";

async function startServer() {
  await writeOpenApiDocument();

  const app = createApp();

  const server = app.listen(config.PORT, () => {
    console.log(`API listening on port ${config.PORT}`);
    console.log(`Swagger UI: http://localhost:${config.PORT}/docs`);
  });

  async function shutdown() {
  const timeout = setTimeout(() => {
    console.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);

    server.close(async () => {
      clearTimeout(timeout);
      await pool.end();
      process.exit(0);
    });
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

startServer().catch(async (error) => {
  console.error(error);
  await pool.end();
  process.exit(1);
});
