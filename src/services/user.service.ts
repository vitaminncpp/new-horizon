import { User } from "@/src/infra/models/user.model";
import { prisma } from "@/src/infra/prisma/prisma.client";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  created_at: true,
  is_deleted: true,
  deleted_at: true,
};

const authUserSelect = {
  ...publicUserSelect,
  password: true,
  session_version: true,
};

export async function createUser(user: User): Promise<User> {
  try {
    return await prisma.user.create({
      select: publicUserSelect,
      data: user as never,
    });
  } catch (error: unknown) {
    throw new Exception(
      ErrorCode.DB_INTERNAL_ERROR,
      (error as Error).message || "Error inserting user record in the database",
      user,
    );
  }
}

export async function getUser(id: string, password?: boolean): Promise<User> {
  const user = await prisma.user.findUnique({
    select: password ? authUserSelect : publicUserSelect,
    where: { id },
  });
  if (!user) {
    throw new Exception(ErrorCode.DB_USER_NOT_FOUND);
  }
  return user;
}

export async function getUserByEmail(email: string, password?: boolean): Promise<User> {
  const user = await prisma.user.findUnique({
    select: password ? authUserSelect : publicUserSelect,
    where: { email },
  });
  if (!user) {
    throw new Exception(ErrorCode.DB_USER_NOT_FOUND);
  }
  return user;
}

export async function incrementSessionVersion(id: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        session_version: {
          increment: 1,
        },
      },
    });
  } catch (error: unknown) {
    throw new Exception(
      ErrorCode.DB_INTERNAL_ERROR,
      (error as Error).message || "Error updating user session version",
      { id },
    );
  }
}
