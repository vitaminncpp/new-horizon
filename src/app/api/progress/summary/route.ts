import { NextRequest } from "next/server";
import { requireSessionUser } from "@/src/infra/auth/auth.server";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as dashboardService from "@/src/services/dashboard.service";

export async function GET(req: NextRequest) {
  try {
    const user = await requireSessionUser(req);
    const item = await dashboardService.getProgressSummary(user.id);
    return apiSuccess({ item });
  } catch (error) {
    return apiError(error, 401);
  }
}
