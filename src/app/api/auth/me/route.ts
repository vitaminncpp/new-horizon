import { NextRequest } from "next/server";
import { getRouteUser } from "@/src/infra/auth/auth.server";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await getRouteUser(req);
    if (!user) {
      return apiError(new Error("Unauthorized"), 401);
    }

    return apiSuccess({ user });
  } catch (error) {
    return apiError(error, 401);
  }
}
