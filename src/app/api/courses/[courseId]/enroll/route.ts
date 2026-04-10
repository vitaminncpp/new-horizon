import { NextRequest } from "next/server";
import { requireRoles } from "@/src/infra/auth/auth.server";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as enrollmentService from "@/src/services/enrollment.service";

type RouteContext = {
  params: Promise<{
    courseId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireRoles(req, ["learner", "instructor", "admin"]);
    const { courseId } = await context.params;
    const enrollment = await enrollmentService.enrollInCourse(user, courseId);
    return apiSuccess(enrollment, { status: 201 });
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
