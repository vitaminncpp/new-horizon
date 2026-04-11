import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE,
  clearAuthCookies,
  setAccessCookie,
  setRefreshCookie,
} from "@/src/infra/auth/auth-cookie";
import { getRouteUser } from "@/src/infra/auth/auth.server";
import { authRoutes, protectedRouteRules, publicRoutes } from "@/src/infra/config/routes.config";
import * as authService from "@/src/services/auth.service";
import { verifyRefreshClaims } from "@/src/services/token.service";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const matchedRule = protectedRouteRules.find((rule) => pathname.startsWith(rule.prefix));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) =>
    route === "/" ? pathname === route : pathname.startsWith(route),
  );

  const user = await getRouteUser(req);

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (!matchedRule) {
    return NextResponse.next();
  }

  if (user) {
    return NextResponse.next();
  }

  const refreshToken = req.cookies.get(AUTH_COOKIE.REFRESH)?.value;
  if (refreshToken) {
    const refreshClaims = verifyRefreshClaims(refreshToken);
    if (refreshClaims) {
      try {
        const session = await authService.refreshSession(refreshClaims);
        const response = NextResponse.next();
        setAccessCookie(response, session.accessToken);
        setRefreshCookie(response, session.refreshToken);
        return response;
      } catch {
        const response = NextResponse.redirect(
          new URL(`/login?next=${encodeURIComponent(pathname)}`, req.nextUrl),
        );
        clearAuthCookies(response);
        return response;
      }
    }
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname)}`, req.nextUrl));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp)$).*)"],
};
