import { NextRequest } from "next/server";
import { requireRoles } from "@/src/infra/auth/auth.server";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import { updateContentBlockSchema } from "@/src/infra/dtos/learning.dto";
import * as contentBlockService from "@/src/services/content-block.service";

type RouteContext = {
  params: Promise<{
    blockId: string;
  }>;
};

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { blockId } = await context.params;
    const payload = updateContentBlockSchema.parse(await req.json());
    const block = await contentBlockService.updateContentBlock(actor, blockId, payload);
    return apiSuccess(block);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { blockId } = await context.params;
    const result = await contentBlockService.deleteContentBlock(actor, blockId);
    return apiSuccess(result);
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
