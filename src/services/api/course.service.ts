import type { Course } from "@/src/services/mock/types";
import type { CourseResponseDto, CoursesResponseDto } from "@/src/infra/dtos/course.dto";
import { http } from "@/src/services/api/http.service";

export type CourseListParams = {
  search?: string;
  categories?: string[];
  difficulty?: string;
  duration?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export async function listCourses(params: CourseListParams = {}) {
  const response = await http.get<CoursesResponseDto>(`/api/courses${toQueryString(params)}`);
  return response.items;
}

export async function listCoursesPage(params: CourseListParams = {}) {
  return http.get<CoursesResponseDto>(`/api/courses${toQueryString(params)}`);
}

export async function getCourse(id: string) {
  const response = await http.get<CourseResponseDto>(`/api/courses/${id}`);
  return response.item as Course;
}

function toQueryString(params: CourseListParams) {
  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }

  params.categories
    ?.filter((category) => category !== "All")
    .forEach((category) => query.append("category", category));

  if (params.difficulty && params.difficulty !== "All") {
    query.set("difficulty", params.difficulty);
  }

  if (params.duration && params.duration !== "All") {
    query.set("duration", params.duration);
  }

  if (params.sort) {
    query.set("sort", params.sort);
  }

  if (params.page) {
    query.set("page", String(params.page));
  }

  if (params.pageSize) {
    query.set("pageSize", String(params.pageSize));
  }

  const value = query.toString();
  return value ? `?${value}` : "";
}
