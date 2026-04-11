import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as courseService from "@/src/services/course.service";

export async function GET() {
  try {
    const items = await courseService.listCourses();
    return apiSuccess({ items });
  } catch (error) {
    return apiError(error);
  }
}
