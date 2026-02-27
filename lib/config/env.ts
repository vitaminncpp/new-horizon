import { z } from "zod";

const authSchema = z.object({
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
});

const databaseSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection URL"),
});

const authParsed = authSchema.safeParse({
  AUTH_SECRET: process.env.AUTH_SECRET,
});

if (!authParsed.success) {
  throw new Error(`Invalid auth environment configuration: ${authParsed.error.message}`);
}

const dbParsed = databaseSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
});

if (!dbParsed.success) {
  throw new Error(`Invalid database environment configuration: ${dbParsed.error.message}`);
}

export const authEnv = authParsed.data;
export const databaseEnv = dbParsed.data;
