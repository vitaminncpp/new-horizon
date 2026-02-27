import { NextResponse } from "next/server";
import { createAuthService } from "@/lib/http/auth-context";
import { handleRouteError } from "@/lib/http/errors";
import { setSessionCookie } from "@/lib/http/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createAuthService().login(body);

    await setSessionCookie(result.token);

    return NextResponse.json({ user: result.user, message: "Login successful" });
  } catch (error) {
    return handleRouteError(error);
  }
}