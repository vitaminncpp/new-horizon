import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as assessmentService from "@/src/services/assessment.service";

export async function GET(_req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await params;
    const items = await assessmentService.getAssessmentsByCourse(courseId);
    return apiSuccess({ items });
  } catch (error) {
    return apiError(error, 404);
  }
}
