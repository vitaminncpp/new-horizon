import "dotenv/config";
import { z } from "zod";
import { Exception } from "../exception/app.exception";
import ErrorCode from "../exception/error.enum";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_ACCESS_EXPIRE: z.string().min(1, "JWT_ACCESS_EXPIRE is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_REFRESH_EXPIRE: z.string().min(1, "JWT_REFRESH_EXPIRE is required"),
  PASSWORD_SALT: z.string().min(1, "PASSWORD_SALT is required"),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Exception(
      ErrorCode.ENV_ERROR,
      "Invalid environment configuration",
      z.treeifyError(result.error).errors,
    );
  }
  return result.data;
}

export const env = parseEnv();
