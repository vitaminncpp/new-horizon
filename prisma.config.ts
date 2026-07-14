import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "src/infra/prisma/schema.prisma",
  migrations: {
    seed: "tsx src/infra/prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
