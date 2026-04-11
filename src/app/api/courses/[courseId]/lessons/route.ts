import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as courseService from "@/src/services/course.service";

export async function GET(_req: Request, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await params;
    const item = await courseService.getCourseLessons(courseId);
    return apiSuccess({ item });
  } catch (error) {
    return apiError(error, 404);
  }
}
