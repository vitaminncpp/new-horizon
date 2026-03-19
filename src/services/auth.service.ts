import * as token from "@/src/services/token.service";
import * as user from "@/src/services/user.service";
import { User } from "@/src/infra/models/user.model";
export async function authenticate() {}

export async function register(email: string, name: string, password: string) {
  const pHash = await token.hash(password);
  return user.create_user({
    email,
    name ,
    password: pHash
  } as User)
}

export async function accessToken(email: string, password: string) {}

export async function refreshToken() {}
