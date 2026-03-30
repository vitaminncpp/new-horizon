import * as token from "@/src/services/token.service";
import * as userService from "@/src/services/user.service";
import { User } from "@/src/infra/models/user.model";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";

export function authenticate(access: string): User | null {
  return token.verifyAccess(access);
}

export async function register(email: string, name: string, password: string) {
  const pHash = await token.hash(password);
  return userService.createUser({
    email,
    name,
    password: pHash,
  } as User);
}

export async function login(email: string, password: string) {
  const user = await userService.getUserByEmail(email);
  const match = await token.comparePass(password, user.password!);
  if (!match) {
    throw new Exception(ErrorCode.INVALID_PASSWORD, "Invalid password", {
      email,
      password,
    });
  }
  const accessToken = token.accessToken(user);
  const refreshToken = token.refreshToken(user);
  return { accessToken, refreshToken, user };
}

export async function refreshToken() {}
