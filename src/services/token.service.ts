import "dotenv/config";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { StringValue } from "ms";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";
import { User } from "@/src/infra/models/user.model";

export function accessToken(payload: any) {
  const secret: string = process.env.JWT_ACCESS_SECRET!;
  const expiresIn: string = process.env.JWT_ACCESS_EXPIRE!;

  return generateToken(payload, secret, expiresIn);
}

export function refreshToken(payload: any) {
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

export function generateToken(payload: any, secret: string, expiresIn: string | number): string {
  let accessToken;
  try {
    accessToken = jwt.sign({ ...payload }, secret, {
      expiresIn: expiresIn as StringValue | number,
    });
  } catch (err: Error | any) {
    throw new Exception(ErrorCode.AUTH_JWT_SIGN, err?.message, payload);
  }
  return accessToken;
}

export function verifyToken(token: string, secret: string): any {
  try {
    const payload = jwt.verify(token, secret);
    if (!payload) {
      throw new Exception(ErrorCode.INVALID_TOKEN, "Invalid Token", token);
    }
    return payload;
  } catch (err: Error | any) {
    if (err instanceof Exception) {
      throw err;
    }
    throw new Exception(ErrorCode.INTERNAL_SERVER_ERROR, err?.message, err);
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
