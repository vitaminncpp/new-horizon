import { NextRequest } from "next/server";
import { getRouteUser } from "@/src/infra/auth/auth.server";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as courseService from "@/src/services/course.service";

export async function GET(req: NextRequest) {
  try {
    const user = await getRouteUser(req);
    const items = await courseService.listCourses(user ? { id: user.id } : null);
    return apiSuccess({ items });
  } catch (error) {
    return apiError(error);
  }
}
