import { NextRequest } from "next/server";
import { requireRoles } from "@/src/infra/auth/auth.server";
import { lessonProgressSchema } from "@/src/infra/dtos/learning.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as lessonService from "@/src/services/lesson.service";

type RouteContext = {
  params: Promise<{
    lessonId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireRoles(req, ["learner", "instructor", "admin"]);
    const { lessonId } = await context.params;
    const payload = lessonProgressSchema.parse(await req.json());
    const progress = await lessonService.markLessonProgress(user, lessonId, payload);
    return apiSuccess(progress);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
