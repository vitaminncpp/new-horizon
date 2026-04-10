import { NextRequest } from "next/server";
import { getRouteUser, requireRoles } from "@/src/infra/auth/auth.server";
import { updateAssessmentSchema } from "@/src/infra/dtos/learning.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as assessmentService from "@/src/services/assessment.service";

type RouteContext = {
  params: Promise<{
    assessmentId: string;
  }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const actor = await getRouteUser(req);
    const { assessmentId } = await context.params;
    const assessment = await assessmentService.getAssessmentDetail(assessmentId, actor ?? undefined);
    return apiSuccess(assessment);
  } catch (error: unknown) {
    return apiError(error, 404);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { assessmentId } = await context.params;
    const payload = updateAssessmentSchema.parse(await req.json());
    const assessment = await assessmentService.updateAssessment(actor, assessmentId, payload);
    return apiSuccess(assessment);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { assessmentId } = await context.params;
    const assessment = await assessmentService.deleteAssessment(actor, assessmentId);
    return apiSuccess(assessment);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
