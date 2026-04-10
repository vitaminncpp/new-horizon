import { NextRequest } from "next/server";
import { AUTH_COOKIE, setAccessCookie, setRefreshCookie } from "@/src/infra/auth/auth-cookie";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as authService from "@/src/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get(AUTH_COOKIE.REFRESH)?.value;
    if (!refreshToken) {
      return apiError(new Error("Refresh token missing"), 401);
    }

    const session = await authService.refreshToken(refreshToken);
    const response = apiSuccess({ user: session.user });
    setAccessCookie(response, session.accessToken);
    setRefreshCookie(response, session.refreshToken);
    return response;
  } catch (error: unknown) {
    return apiError(error, 401);
  }
}
