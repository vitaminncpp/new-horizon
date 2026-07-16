import { NextRequest } from "next/server";
import { getRouteUser } from "@/src/infra/auth/auth.server";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as courseService from "@/src/services/course.service";
import type { ListCoursesFilters } from "@/src/services/catalog.service";

export async function GET(req: NextRequest) {
  try {
    const user = await getRouteUser(req);
    const filters = parseCourseFilters(req.nextUrl.searchParams);
    const data = await courseService.listCoursesWithMeta(user ? { id: user.id } : null, filters);
    return apiSuccess(data);
  } catch (error) {
    return apiError(error);
  }
}

function parseCourseFilters(params: URLSearchParams): ListCoursesFilters {
  const page = Number(params.get("page") ?? "1");
  const pageSize = Number(params.get("pageSize") ?? "6");
  const categories = params
    .getAll("category")
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);
  const difficulty = params.get("difficulty");
  const duration = params.get("duration");
  const sort = params.get("sort");

  return {
    search: params.get("search") ?? undefined,
    categories: categories.length > 0 ? categories : undefined,
    difficulty:
      difficulty === "Beginner" || difficulty === "Intermediate" || difficulty === "Advanced"
        ? difficulty
        : undefined,
    duration:
      duration === "0-2" || duration === "3-6" || duration === "7-plus" ? duration : undefined,
    sort: sort === "latest" || sort === "rating" || sort === "popular" ? sort : undefined,
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 6,
  };
}
