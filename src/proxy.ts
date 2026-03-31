import { NextRequest, NextResponse } from "next/server";
import { AuthEnum } from "@/src/infra/enums/auth.enum";
import { publicRoutes } from "@/src/infra/config/routes.config";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(`/${route}`));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AuthEnum.ACCESS_TOKEN)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  try {
    return NextResponse.next();
  } catch (error) {
    console.error("Auth guard error:", error);
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
