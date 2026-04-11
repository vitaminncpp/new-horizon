import { NextRequest } from "next/server";
import { requireSessionUser } from "@/src/infra/auth/auth.server";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as enrollmentService from "@/src/services/enrollment.service";

export async function GET(req: NextRequest) {
  try {
    const user = await requireSessionUser(req);
    const items = await enrollmentService.getEnrollments(user.id);
    return apiSuccess({ items });
  } catch (error) {
    return apiError(error, 404);
  }
}
