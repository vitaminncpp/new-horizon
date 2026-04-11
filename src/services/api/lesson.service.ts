import type { CourseLessons } from "@/src/services/mock/types";
import type { CourseLessonsResponseDto } from "@/src/infra/dtos/course.dto";
import { http } from "@/src/services/api/http.service";

export async function getLessonsByCourse(courseId: string) {
  const response = await http.get<CourseLessonsResponseDto>(`/api/courses/${courseId}/lessons`);
  return response.item as CourseLessons;
}
