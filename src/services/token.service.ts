import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { StringValue } from "ms";
import { z } from "zod";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";
import { env } from "@/src/infra/config/env.config";
import { User } from "@/src/infra/models/user.model";

const authClaimsSchema = z.object({
  sub: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["learner", "instructor", "admin"]),
  sessionVersion: z.number().int().positive(),
  type: z.enum(["access", "refresh"]),
});

export type AuthClaims = z.infer<typeof authClaimsSchema>;

function buildClaims(user: User, type: AuthClaims["type"]): AuthClaims {
  return {
    sub: user.id,
    email: user.email,
    role: user.role,
    sessionVersion: user.session_version ?? 1,
    type,
  };
}

export function accessToken(user: User) {
  const secret: string = env.JWT_ACCESS_SECRET;
  const expiresIn: string = env.JWT_ACCESS_EXPIRE;

  return generateToken(buildClaims(user, "access"), secret, expiresIn);
}

export function refreshToken(user: User) {
  const secret: string = env.JWT_REFRESH_SECRET;
  const expiresIn: string = env.JWT_REFRESH_EXPIRE;
  return generateToken(buildClaims(user, "refresh"), secret, expiresIn);
}

export function verifyAccessClaims(token: string): AuthClaims | null {
  const secret: string = env.JWT_ACCESS_SECRET;
  const payload = verifyToken(token, secret, false);
  return payload ? parseClaims(payload, "access") : null;
}

export function verifyRefreshClaims(token: string): AuthClaims | null {
  const secret: string = env.JWT_REFRESH_SECRET;
  const payload = verifyToken(token, secret, false);
  return payload ? parseClaims(payload, "refresh") : null;
}

export function verifyAccess(token: string): AuthClaims | null {
  return verifyAccessClaims(token);
}

export function verifyRefresh(token: string): AuthClaims | null {
  return verifyRefreshClaims(token);
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

export function verifyToken(token: string, secret: string, throwOnError = true): unknown {
  try {
    const payload = jwt.verify(token, secret);
    if (!payload) {
      throw new Exception(ErrorCode.INVALID_TOKEN, "Invalid Token", token);
    }
    return payload;
  } catch (err: unknown) {
    if (!throwOnError) {
      return null;
    }
    if (err instanceof Exception) {
      throw err;
    }
    throw new Exception(ErrorCode.INTERNAL_SERVER_ERROR, (err as Error)?.message, err);
  }
}

function parseClaims(payload: unknown, type: AuthClaims["type"]) {
  const result = authClaimsSchema.safeParse(payload);
  if (!result.success) {
    return null;
  }
  if (result.data.type !== type) {
    return null;
  }
  return result.data;
}

export async function hash(password: string): Promise<string> {
  const saltedPassword = password + env.PASSWORD_SALT;
  return (await bcrypt.hash(saltedPassword, 10)) as string;
}

export async function comparePass(password: string, hash: string): Promise<boolean> {
  const saltedPassword = password + env.PASSWORD_SALT;
  return bcrypt.compare(saltedPassword, hash);
}
