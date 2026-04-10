import { NextResponse } from "next/server";
import { env } from "@/src/infra/config/env.config";

export const AUTH_COOKIE = {
  ACCESS: "nh_access_token",
  REFRESH: "nh_refresh_token",
} as const;

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  path: "/",
};

export function setAccessCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE.ACCESS, token, {
    ...baseCookieOptions,
    maxAge: 60 * 15,
  });
}

export function setRefreshCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE.REFRESH, token, {
    ...baseCookieOptions,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE.ACCESS, "", {
    ...baseCookieOptions,
    maxAge: 0,
  });
  response.cookies.set(AUTH_COOKIE.REFRESH, "", {
    ...baseCookieOptions,
    maxAge: 0,
  });
}
