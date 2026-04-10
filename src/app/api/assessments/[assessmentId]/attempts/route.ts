import { NextRequest } from "next/server";
import { requireRoles } from "@/src/infra/auth/auth.server";
import { submitAssessmentSchema } from "@/src/infra/dtos/learning.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as assessmentService from "@/src/services/assessment.service";

type RouteContext = {
  params: Promise<{
    assessmentId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireRoles(req, ["learner", "instructor", "admin"]);
    const { assessmentId } = await context.params;
    const payload = submitAssessmentSchema.parse(await req.json());
    const attempt = await assessmentService.submitAssessmentAttempt(user, assessmentId, payload);
    return apiSuccess(attempt, { status: 201 });
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
