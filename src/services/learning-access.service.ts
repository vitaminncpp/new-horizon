import { prisma } from "@/src/infra/prisma/prisma.client";
import { User } from "@/src/infra/models/user.model";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";

export function assertCourseManagerRole(actor: User) {
  if (actor.role !== "instructor" && actor.role !== "admin") {
    throw new Exception(ErrorCode.FORBIDDEN, "Only instructors and admins can manage course content");
  }
}

export function assertCourseOwnership(actor: User, creatorId: string) {
  assertCourseManagerRole(actor);
  if (actor.role === "admin") {
    return;
  }
  if (actor.id !== creatorId) {
    throw new Exception(ErrorCode.FORBIDDEN, "You do not own this course", {
      actorId: actor.id,
      creatorId,
    });
  }
}

export async function getManagedCourse(actor: User, courseId: string) {
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      is_deleted: false,
    },
    select: {
      id: true,
      creator_id: true,
      status: true,
    },
  });

  if (!course) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Course not found", { courseId });
  }

  assertCourseOwnership(actor, course.creator_id);
  return course;
}
