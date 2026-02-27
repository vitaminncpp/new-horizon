import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/http/session";
import { createTokenService } from "@/lib/http/token-context";

const protectedPaths = ["/dashboard"];
const authPaths = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const pathname = request.nextUrl.pathname;

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (!token) {
    if (isProtectedPath) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  const payload = await createTokenService().verify(token);

  if (!payload && isProtectedPath) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    const response = NextResponse.redirect(url);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  if (payload && isAuthPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
