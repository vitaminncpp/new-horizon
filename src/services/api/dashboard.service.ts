import type { DashboardResponseDto } from "@/src/infra/dtos/course.dto";
import { http } from "@/src/services/api/http.service";

export async function getDashboardData() {
  return http.get<DashboardResponseDto>("/api/dashboard");
}
