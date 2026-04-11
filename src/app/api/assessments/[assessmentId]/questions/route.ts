import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as assessmentService from "@/src/services/assessment.service";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ assessmentId: string }> },
) {
  try {
    const { assessmentId } = await params;
    const items = await assessmentService.getAssessmentQuestions(assessmentId);
    return apiSuccess({ items });
  } catch (error) {
    return apiError(error, 404);
  }
}
