import { User } from "@/src/infra/models/user.model";
import { prisma } from "@/src/infra/prisma/prisma.client";

export async function create_user(data: User): Promise<User> {
  const u = await prisma.user.create({ data });
  delete u.password;
  return u;
}
