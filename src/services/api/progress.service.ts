import type { ProgressSummaryDto } from "@/src/infra/dtos/course.dto";
import { http } from "@/src/services/api/http.service";

type ProgressRecord = ProgressSummaryDto;

type ProgressResponseDto = {
  item: ProgressRecord;
};

export async function getProgressSummary() {
  const response = await http.get<ProgressResponseDto>("/api/progress/summary");
  return response.item;
}
