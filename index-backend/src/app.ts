import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { config } from "./config/config";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { createOpenApiDocument } from "./openapi/openapi";
import { projectRoutes } from "./routes/projectRoutes";

export function createApp() {
  const app = express();
  const openApiDocument = createOpenApiDocument();

  app.use(
    cors({
      origin: config.CORS_ORIGIN === "*" ? true : config.CORS_ORIGIN,
    }),
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  app.use("/api/v1/projects", projectRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
