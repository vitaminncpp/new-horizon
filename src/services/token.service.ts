import "dotenv/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { StringValue } from "ms";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";
import { User } from "@/src/infra/models/user.model";

export function accessToken(payload: unknown) {
  const secret: string = process.env.JWT_ACCESS_SECRET!;
  const expiresIn: string = process.env.JWT_ACCESS_EXPIRE!;

  return generateToken(payload, secret, expiresIn);
}

export function refreshToken(payload: unknown) {
  const secret: string = process.env.JWT_REFRESH_SECRET!;
  const expiresIn: string = process.env.JWT_REFRESH_EXPIRE!;
  return generateToken(payload, secret, expiresIn);
}

export function verifyAccess(token: string): User | null {
  const secret: string = process.env.JWT_ACCESS_SECRET!;
  return verifyToken(token, secret) as User;
}

export function verifyRefresh(token: string): User | null {
  const secret: string = process.env.JWT_REFRESH_SECRET!;
  return verifyToken(token, secret) as User;
}

export function generateToken(
  payload: unknown,
  secret: string,
  expiresIn: string | number,
): string {
  let token;
  try {
    token = jwt.sign({ ...(payload as object) }, secret, {
      expiresIn: expiresIn as StringValue | number,
    });
  } catch (err: unknown) {
    throw new Exception(ErrorCode.AUTH_JWT_SIGN, (err as Error)?.message, payload);
  }
  return token;
}

export function verifyToken(token: string, secret: string): unknown {
  try {
    const payload = jwt.verify(token, secret);
    if (!payload) {
      throw new Exception(ErrorCode.INVALID_TOKEN, "Invalid Token", token);
    }
    return payload;
  } catch (err: unknown) {
    if (err instanceof Exception) {
      throw err;
    }
    throw new Exception(ErrorCode.INTERNAL_SERVER_ERROR, (err as Error)?.message, err);
  }
}

export async function hash(password: string): Promise<string> {
  const saltedPassword = password + process.env.PASSWORD_SALT;
  return (await bcrypt.hash(saltedPassword, 10)) as string;
}

export async function comparePass(password: string, hash: string): Promise<boolean> {
  const saltedPassword = password + process.env.PASSWORD_SALT;
  return bcrypt.compare(saltedPassword, hash);
}
