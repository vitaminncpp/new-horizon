import { NextRequest } from "next/server";
import { requireRoles } from "@/src/infra/auth/auth.server";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as enrollmentService from "@/src/services/enrollment.service";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRoles(req, ["learner", "instructor", "admin"]);
    const enrollments = await enrollmentService.listEnrolledCourses(user);
    return apiSuccess(enrollments);
  } catch (error: unknown) {
    return apiError(error, 401);
  }
}
