import "dotenv/config";
import { z } from "zod";

const configSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3003),
  CORS_ORIGIN: z.string().default("*"),
  DB_HOST: z.string().default("localhost"),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().default("user123"),
  DB_PASSWORD: z.string().default("password123"),
  DB_NAME: z.string().default("db123"),
});

export const config = configSchema.parse(process.env);
