import { NextRequest } from "next/server";
import { requireRoles } from "@/src/infra/auth/auth.server";
import { gradeAssessmentAttemptSchema } from "@/src/infra/dtos/learning.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as assessmentService from "@/src/services/assessment.service";

type RouteContext = {
  params: Promise<{
    attemptId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { attemptId } = await context.params;
    const payload = gradeAssessmentAttemptSchema.parse(await req.json());
    const attempt = await assessmentService.gradeAssessmentAttempt(actor, attemptId, payload);
    return apiSuccess(attempt);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
