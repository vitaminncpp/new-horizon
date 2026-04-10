import { NextRequest } from "next/server";
import { createCourseSchema } from "@/src/infra/dtos/course.dto";
import { apiError, apiSuccess } from "@/src/infra/http/api-response";
import { getRouteUser, requireRoles } from "@/src/infra/auth/auth.server";
import * as courseService from "@/src/services/course.service";

export async function GET(req: NextRequest) {
  try {
    const actor = await getRouteUser(req);
    const status = req.nextUrl.searchParams.get("status");
    const creatorId = req.nextUrl.searchParams.get("creatorId") ?? undefined;
    const enrolled = req.nextUrl.searchParams.get("enrolled") === "true";

    const courses = await courseService.listCourses({
      actor: actor ?? undefined,
      status:
        status === "draft" || status === "published" || status === "archived" ? status : undefined,
      creatorId,
      enrolled,
    });
    return apiSuccess(courses);
  } catch (error: unknown) {
    return apiError(error, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireRoles(req, ["instructor", "admin"]);
    const payload = createCourseSchema.parse(await req.json());
    const course = await courseService.createCourse(actor, payload);
    return apiSuccess(course, { status: 201 });
  } catch (error: unknown) {
    return apiError(error, 400);
  }
}
