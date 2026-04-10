import { NextRequest } from "next/server";
import { requireRoles } from "@/src/infra/auth/auth.server";
import { createQuestionSchema } from "@/src/infra/dtos/learning.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as questionService from "@/src/services/question.service";

type RouteContext = {
  params: Promise<{
    assessmentId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { assessmentId } = await context.params;
    const payload = createQuestionSchema.parse(await req.json());
    const question = await questionService.createQuestion(actor, assessmentId, payload);
    return apiSuccess(question, { status: 201 });
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
