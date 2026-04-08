import { NextRequest, NextResponse } from "next/server";
import { AuthEnum } from "@/src/infra/enums/auth.enum";
import { publicRoutes } from "@/src/infra/config/routes.config";
import { authenticate, refreshToken } from "@/src/services/auth.service";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const redirectUrl = new URL(`/login?next=${encodeURIComponent(pathname)}`, req.nextUrl);
  const token =
    req.cookies.get(AuthEnum.ACCESS_TOKEN)?.value ||
    req.headers.get("Authorization")?.replace("Bearer ", "");

  const refresh = req.cookies.get(AuthEnum.REFRESH_TOKEN)?.value;

  if (!token) {
    if (refresh) {
      try {
        const auth = await refreshToken(refresh);
        const response = NextResponse.next();
        const cookieOptions = {
          path: "/",
          maxAge: 3600, // Or use from process.env
          secure: true,
          httpOnly: false, // Accessible from client since we are responding with tokens in body
        };
        response.cookies.set(AuthEnum.ACCESS_TOKEN, auth.accessToken, cookieOptions);
        response.cookies.set(AuthEnum.REFRESH_TOKEN, auth.refreshToken, cookieOptions);
        return response;
      } catch {
        return NextResponse.redirect(redirectUrl);
      }
    }
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const user = authenticate(token);
    if (!user) {
      if (refresh) {
        const auth = await refreshToken(refresh);
        const response = NextResponse.next();
        const cookieOptions = {
          path: "/",
          maxAge: 3600,
          secure: true,
          httpOnly: false,
        };
        response.cookies.set(AuthEnum.ACCESS_TOKEN, auth.accessToken, cookieOptions);
        response.cookies.set(AuthEnum.REFRESH_TOKEN, auth.refreshToken, cookieOptions);
        return response;
      }
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  } catch (error) {
    console.error("Auth guard error:", error);
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
