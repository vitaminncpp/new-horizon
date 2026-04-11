import { NextRequest } from "next/server";
import { getRouteUser } from "@/src/infra/auth/auth.server";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as courseService from "@/src/services/course.service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    const user = await getRouteUser(req);
    const { courseId } = await params;
    const item = await courseService.getCourse(courseId, user ? { id: user.id } : null);
    return apiSuccess({ item });
  } catch (error) {
    return apiError(error, 404);
  }
}
