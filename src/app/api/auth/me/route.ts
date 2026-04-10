import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import { requireSessionUser } from "@/src/infra/auth/auth.server";

export async function GET(req: NextRequest) {
  try {
    const user = await requireSessionUser(req);
    return apiSuccess({ user });
  } catch (error: unknown) {
    return apiError(error, 401);
  }
}
