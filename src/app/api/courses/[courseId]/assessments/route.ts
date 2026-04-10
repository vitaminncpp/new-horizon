import { NextRequest } from "next/server";
import { requireRoles } from "@/src/infra/auth/auth.server";
import { createAssessmentSchema } from "@/src/infra/dtos/learning.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as assessmentService from "@/src/services/assessment.service";

type RouteContext = {
  params: Promise<{
    courseId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { courseId } = await context.params;
    const payload = createAssessmentSchema.parse(await req.json());
    const assessment = await assessmentService.createAssessment(actor, courseId, payload);
    return apiSuccess(assessment, { status: 201 });
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
