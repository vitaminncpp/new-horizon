import { NextRequest } from "next/server";
import { requireRoles } from "@/src/infra/auth/auth.server";
import { createSubmissionSchema } from "@/src/infra/dtos/learning.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as codingExerciseService from "@/src/services/coding-exercise.service";

type RouteContext = {
  params: Promise<{
    exerciseId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const user = await requireRoles(req, ["learner", "instructor", "admin"]);
    const { exerciseId } = await context.params;
    const payload = createSubmissionSchema.parse(await req.json());
    const submission = await codingExerciseService.createSubmission(user, exerciseId, payload);
    return apiSuccess(submission, { status: 201 });
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
