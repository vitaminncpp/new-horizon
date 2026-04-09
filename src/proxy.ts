import { NextRequest, NextResponse } from "next/server";
import { publicRoutes } from "@/src/infra/config/routes.config";
import { authenticate } from "@/src/services/auth.service";

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }
  const redirectUrl = new URL(`/login?next=${encodeURIComponent(pathname)}`, req.nextUrl);

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error("Unauthorized");
    }
    const user = authenticate(token);
    if (!user) {
      throw new Error("Unauthorized");
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
