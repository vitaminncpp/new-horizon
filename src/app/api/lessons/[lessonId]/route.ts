import { NextRequest } from "next/server";
import { getRouteUser } from "@/src/infra/auth/auth.server";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as lessonService from "@/src/services/lesson.service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  try {
    const user = await getRouteUser(req);
    const { lessonId } = await params;
    const item = await lessonService.getLesson(lessonId, user ? { id: user.id } : null);
    return apiSuccess({ item });
  } catch (error) {
    return apiError(error, 404);
  }
}
