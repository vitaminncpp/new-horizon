import { NextRequest } from "next/server";
import { requireSessionUser } from "@/src/infra/auth/auth.server";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as assessmentService from "@/src/services/assessment.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assessmentId: string }> },
) {
  try {
    const user = await requireSessionUser(req);
    const { assessmentId } = await params;
    const items = await assessmentService.getAssessmentAttempts(assessmentId, user.id);
    return apiSuccess({ items });
  } catch (error) {
    return apiError(error, 404);
  }
}
