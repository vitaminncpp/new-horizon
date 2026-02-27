import type { UserRepository } from "@/lib/domain/repositories/user-repository";
import type { User } from "@/lib/domain/entities/user";
import { prisma } from "@/lib/infrastructure/prisma/prisma";

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return null;
    }

    return user;
  }

  async create(input: { email: string; passwordHash: string }): Promise<User> {
    return prisma.user.create({ data: input });
  }
}
