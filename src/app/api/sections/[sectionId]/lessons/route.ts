import { NextRequest } from "next/server";
import { requireRoles } from "@/src/infra/auth/auth.server";
import { createLessonSchema } from "@/src/infra/dtos/learning.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as lessonService from "@/src/services/lesson.service";

type RouteContext = {
  params: Promise<{
    sectionId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { sectionId } = await context.params;
    const payload = createLessonSchema.parse(await req.json());
    const lesson = await lessonService.createLesson(actor, sectionId, payload);
    return apiSuccess(lesson, { status: 201 });
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
