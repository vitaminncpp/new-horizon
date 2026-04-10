import { NextRequest } from "next/server";
import * as authService from "@/src/services/auth.service";
import { registerRequestSchema } from "@/src/infra/dtos/auth.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import { setAccessCookie, setRefreshCookie } from "@/src/infra/auth/auth-cookie";

export async function POST(req: NextRequest) {
  try {
    const { email, name, password } = registerRequestSchema.parse(await req.json());
    await authService.register(email, name, password);
    const session = await authService.login(email, password);
    const response = apiSuccess({ user: session.user });
    setAccessCookie(response, session.accessToken);
    setRefreshCookie(response, session.refreshToken);
    return response;
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
