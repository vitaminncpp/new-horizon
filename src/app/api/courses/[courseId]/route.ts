import { NextRequest } from "next/server";
import { updateCourseSchema } from "@/src/infra/dtos/course.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import { getRouteUser, requireRoles } from "@/src/infra/auth/auth.server";
import * as courseService from "@/src/services/course.service";

type RouteContext = {
  params: Promise<{
    courseId: string;
  }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const actor = await getRouteUser(req);
    const { courseId } = await context.params;
    const course = await courseService.getCourseDetail(courseId, actor ?? undefined);
    return apiSuccess(course);
  } catch (error: unknown) {
    return apiError(error, 404);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { courseId } = await context.params;
    const payload = updateCourseSchema.parse(await req.json());
    const course = await courseService.updateCourse(actor, courseId, payload);
    return apiSuccess(course);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { courseId } = await context.params;
    const course = await courseService.deleteCourse(actor, courseId);
    return apiSuccess(course);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
