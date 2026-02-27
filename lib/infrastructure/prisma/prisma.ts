import { PrismaClient, Prisma as P } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

class PrismaService extends PrismaClient {
  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    super({
      adapter: new PrismaPg(pool),
      log: ["query", "info", "warn", "error"],
    });
    this.$connect();
  }
}

export const prisma =  new PrismaService();
export import Prisma = P;

