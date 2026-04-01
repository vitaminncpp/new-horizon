import { NextRequest, NextResponse } from "next/server";
import { AuthEnum } from "@/src/infra/enums/auth.enum";
import { publicRoutes } from "@/src/infra/config/routes.config";
import { authenticate } from "@/src/services/auth.service";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const redirectUrl = new URL(`/login?next=${encodeURIComponent(pathname)}`, req.nextUrl);
  const token = req.cookies.get(AuthEnum.ACCESS_TOKEN)?.value;

  if (!token) {
    return NextResponse.redirect(redirectUrl);
  }
  try {
    const user = authenticate(token);
    if (!user) {
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
