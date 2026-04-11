import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as assessmentService from "@/src/services/assessment.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ assessmentId: string }> },
) {
  try {
    const { assessmentId } = await params;
    const item = await assessmentService.getAssessment(assessmentId);
    return apiSuccess({ item });
  } catch (error) {
    return apiError(error, 404);
  }
}
