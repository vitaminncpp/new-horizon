"use server";
import { cookies } from "next/headers";
import * as authService from "@/src/services/auth.service";

export async function register(email: string, name: string, password: string) {
  return authService.register(email, name, password);
}

export async function login(email: string, password: string) {
  const cookie = await cookies();
  const auth = await authService.login(email, password);

  const c = {
    secure: true,
    httpOnly: true,
    path: "/",
    maxAge: Number(process.env.COOKIE_AGE || 0),
  };
  cookie.set("access", auth.accessToken, c);
  cookie.set("refresh", auth.refreshToken, c);

  return auth.user;
}
