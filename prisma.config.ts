import "dotenv/config";
import { defineConfig, env } from "prisma/config";
import { env as appEnv } from "./src/infra/config/env.config";

export default defineConfig({
  schema: "src/infra/prisma/schema.prisma",
  datasource: {
    url: appEnv.DATABASE_URL || env("DATABASE_URL"),
  },
});
