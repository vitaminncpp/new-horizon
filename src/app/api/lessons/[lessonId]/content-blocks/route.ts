import { NextRequest } from "next/server";
import { requireRoles } from "@/src/infra/auth/auth.server";
import { contentBlockSchema } from "@/src/infra/dtos/learning.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as contentBlockService from "@/src/services/content-block.service";

type RouteContext = {
  params: Promise<{
    lessonId: string;
  }>;
};

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { lessonId } = await context.params;
    const payload = contentBlockSchema.parse(await req.json());
    const block = await contentBlockService.createContentBlock(actor, lessonId, payload);
    return apiSuccess(block, { status: 201 });
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
