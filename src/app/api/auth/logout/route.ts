import { NextRequest } from "next/server";
import { AUTH_COOKIE, clearAuthCookies } from "@/src/infra/auth/auth-cookie";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as authService from "@/src/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    await authService.logout(
      req.cookies.get(AUTH_COOKIE.ACCESS)?.value,
      req.cookies.get(AUTH_COOKIE.REFRESH)?.value,
    );

    const response = apiSuccess({ ok: true });
    clearAuthCookies(response);
    return response;
  } catch (error) {
    return apiError(error, 400);
  }
}
