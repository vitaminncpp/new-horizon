import { NextRequest } from "next/server";
import { getRouteUser, requireRoles } from "@/src/infra/auth/auth.server";
import { updateLessonSchema } from "@/src/infra/dtos/learning.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as lessonService from "@/src/services/lesson.service";

type RouteContext = {
  params: Promise<{
    lessonId: string;
  }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const actor = await getRouteUser(req);
    const { lessonId } = await context.params;
    const lesson = await lessonService.getLessonDetail(lessonId, actor ?? undefined);
    return apiSuccess(lesson);
  } catch (error: unknown) {
    return apiError(error, 404);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { lessonId } = await context.params;
    const payload = updateLessonSchema.parse(await req.json());
    const lesson = await lessonService.updateLesson(actor, lessonId, payload);
    return apiSuccess(lesson);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { lessonId } = await context.params;
    const lesson = await lessonService.deleteLesson(actor, lessonId);
    return apiSuccess(lesson);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
