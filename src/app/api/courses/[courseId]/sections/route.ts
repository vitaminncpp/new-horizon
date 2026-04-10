import { NextRequest } from "next/server";
import { getRouteUser, requireRoles } from "@/src/infra/auth/auth.server";
import { createSectionSchema } from "@/src/infra/dtos/learning.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import * as sectionService from "@/src/services/section.service";

type RouteContext = {
  params: Promise<{
    courseId: string;
  }>;
};

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const actor = await getRouteUser(req);
    const { courseId } = await context.params;
    const sections = await sectionService.listSections(courseId, actor ?? undefined);
    return apiSuccess(sections);
  } catch (error: unknown) {
    return apiError(error, 404);
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const { courseId } = await context.params;
    const payload = createSectionSchema.parse(await req.json());
    const section = await sectionService.createSection(actor, courseId, payload);
    return apiSuccess(section, { status: 201 });
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
