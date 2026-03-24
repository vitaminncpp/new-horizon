"use server";
import { cookies } from "next/headers";
import * as authService from "@/src/services/auth.service";
import AuthToken from "@/src/infra/models/auth.model";

export async function register(email: string, name: string, password: string) {
  await authService.register(email, name, password);
  const auth = await authService.login(email, password);
  await setAuthCookies(auth);
  return auth.user;
}

export async function login(email: string, password: string) {
  const auth = await authService.login(email, password);
  await setAuthCookies(auth);
  return auth.user;
}

async function setAuthCookies(auth: AuthToken) {
  const cookie = await cookies();

  const c = {
    secure: true,
    httpOnly: true,
    path: "/",
    maxAge: Number(process.env.COOKIE_AGE || 0),
  };
  cookie.set("access", auth.accessToken, c);
  cookie.set("refresh", auth.refreshToken, c);
}
