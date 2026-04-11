import type { Course } from "@/src/services/mock/types";
import type { CourseResponseDto, CoursesResponseDto } from "@/src/infra/dtos/course.dto";
import { http } from "@/src/services/api/http.service";

export async function listCourses() {
  const response = await http.get<CoursesResponseDto>("/api/courses");
  return response.items;
}

export async function getCourse(id: string) {
  const response = await http.get<CourseResponseDto>(`/api/courses/${id}`);
  return response.item as Course;
}
