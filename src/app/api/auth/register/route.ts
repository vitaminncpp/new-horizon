import { NextRequest } from "next/server";
import { registerRequestSchema } from "@/src/infra/dtos/auth.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import { setAccessCookie, setRefreshCookie } from "@/src/infra/auth/auth-cookie";
import * as authService from "@/src/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = registerRequestSchema.parse(await req.json());
    await authService.register(body.email, body.name, body.password);
    const session = await authService.login(body.email, body.password);
    const response = apiSuccess({ user: session.user });

    setAccessCookie(response, session.accessToken);
    setRefreshCookie(response, session.refreshToken);

    return response;
  } catch (error) {
    return apiError(error, 400);
  }
}
