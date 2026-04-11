import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as dashboardService from "@/src/services/dashboard.service";

export async function GET() {
  try {
    const data = await dashboardService.getDashboardData();
    return apiSuccess(data);
  } catch (error) {
    return apiError(error);
  }
}
