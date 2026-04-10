import { NextRequest } from "next/server";
import { AUTH_COOKIE, clearAuthCookies } from "@/src/infra/auth/auth-cookie";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as authService from "@/src/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get(AUTH_COOKIE.ACCESS)?.value;
    const refreshToken = req.cookies.get(AUTH_COOKIE.REFRESH)?.value;

    await authService.logout(accessToken, refreshToken);

    const response = apiSuccess({ success: true });
    clearAuthCookies(response);
    return response;
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
