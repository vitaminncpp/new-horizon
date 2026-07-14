import { NextRequest } from "next/server";
import { loginRequestSchema } from "@/src/infra/dtos/auth.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import { setAccessCookie, setRefreshCookie } from "@/src/infra/auth/auth-cookie";
import * as authService from "@/src/services/auth.service";
import ErrorCode from "@/src/infra/exception/error.enum";
import { Exception } from "@/src/infra/exception/app.exception";

export async function POST(req: NextRequest) {
  try {
    const body = loginRequestSchema.parse(await req.json());
    const session = await authService.login(body.email, body.password);
    const response = apiSuccess({ user: session.user });

    setAccessCookie(response, session.accessToken);
    setRefreshCookie(response, session.refreshToken);

    return response;
  } catch (error) {
    if (
      error instanceof Exception &&
      (error.code === ErrorCode.DB_USER_NOT_FOUND || error.code === ErrorCode.INVALID_PASSWORD)
    ) {
      return apiError(new Exception(ErrorCode.UNAUTHORIZED, "Invalid credentials"), 401);
    }
    return apiError(error, 400);
  }
}
