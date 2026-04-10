import { NextRequest } from "next/server";
import { getRouteUser, requireRoles } from "@/src/infra/auth/auth.server";
import { updateCodingExerciseSchema } from "@/src/infra/dtos/learning.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as codingExerciseService from "@/src/services/coding-exercise.service";

type RouteContext = {
  params: Promise<{
    exerciseId: string;
  }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const actor = await getRouteUser(req);
    const { exerciseId } = await context.params;
    const exercise = await codingExerciseService.getCodingExerciseDetail(
      exerciseId,
      actor ?? undefined,
    );
    return apiSuccess(exercise);
  } catch (error: unknown) {
    return apiError(error, 404);
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { exerciseId } = await context.params;
    const payload = updateCodingExerciseSchema.parse(await req.json());
    const exercise = await codingExerciseService.updateCodingExercise(actor, exerciseId, payload);
    return apiSuccess(exercise);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { exerciseId } = await context.params;
    const exercise = await codingExerciseService.deleteCodingExercise(actor, exerciseId);
    return apiSuccess(exercise);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
