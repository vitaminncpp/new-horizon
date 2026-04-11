import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as dashboardService from "@/src/services/dashboard.service";

export async function GET() {
  try {
    const item = await dashboardService.getProgressSummary();
    return apiSuccess({ item });
  } catch (error) {
    return apiError(error);
  }
}
