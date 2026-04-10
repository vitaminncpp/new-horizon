import { NextRequest } from "next/server";
import { requireRoles } from "@/src/infra/auth/auth.server";
import { updateSectionSchema } from "@/src/infra/dtos/learning.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as sectionService from "@/src/services/section.service";

type RouteContext = {
  params: Promise<{
    sectionId: string;
  }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { sectionId } = await context.params;
    const payload = updateSectionSchema.parse(await req.json());
    const section = await sectionService.updateSection(actor, sectionId, payload);
    return apiSuccess(section);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { sectionId } = await context.params;
    const section = await sectionService.deleteSection(actor, sectionId);
    return apiSuccess(section);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
