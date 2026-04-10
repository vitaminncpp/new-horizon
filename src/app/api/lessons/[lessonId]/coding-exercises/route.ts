import { NextRequest } from "next/server";
import { requireRoles } from "@/src/infra/auth/auth.server";
import { createCodingExerciseSchema } from "@/src/infra/dtos/learning.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as codingExerciseService from "@/src/services/coding-exercise.service";

type RouteContext = {
  params: Promise<{
    lessonId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { lessonId } = await context.params;
    const payload = createCodingExerciseSchema.parse(await req.json());
    const exercise = await codingExerciseService.createCodingExercise(actor, lessonId, payload);
    return apiSuccess(exercise, { status: 201 });
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
