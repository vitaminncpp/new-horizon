import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as lessonService from "@/src/services/lesson.service";

export async function GET(_req: Request, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const { lessonId } = await params;
    const items = await lessonService.getLessonCodingExercises(lessonId);
    return apiSuccess({ items });
  } catch (error) {
    return apiError(error, 404);
  }
}
