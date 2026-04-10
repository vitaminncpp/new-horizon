import { NextRequest } from "next/server";
import { requireRoles } from "@/src/infra/auth/auth.server";
import { updateQuestionSchema } from "@/src/infra/dtos/learning.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as questionService from "@/src/services/question.service";

type RouteContext = {
  params: Promise<{
    questionId: string;
  }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { questionId } = await context.params;
    const payload = updateQuestionSchema.parse(await req.json());
    const question = await questionService.updateQuestion(actor, questionId, payload);
    return apiSuccess(question);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { questionId } = await context.params;
    const result = await questionService.deleteQuestion(actor, questionId);
    return apiSuccess(result);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
