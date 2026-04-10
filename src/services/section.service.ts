import { Prisma } from "@prisma/client";
import { prisma } from "@/src/infra/prisma/prisma.client";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";
import { CreateSectionDto, UpdateSectionDto } from "@/src/infra/dtos/learning.dto";
import { User } from "@/src/infra/models/user.model";
import { getManagedCourse } from "@/src/services/learning-access.service";

const sectionSelect = {
  id: true,
  course_id: true,
  title: true,
  description: true,
  position: true,
  created_at: true,
  updated_at: true,
} as const;

export async function listSections(courseId: string, actor?: User) {
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      is_deleted: false,
      ...(actor?.role === "learner" || !actor ? { status: "published" } : {}),
    },
    select: { id: true },
  });

  if (!course) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Course not found", { courseId });
  }

  return prisma.course_section.findMany({
    where: {
      course_id: courseId,
      is_deleted: false,
    },
    select: {
      ...sectionSelect,
      lessons: {
        where: { is_deleted: false },
        orderBy: { position: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          position: true,
          estimated_minutes: true,
          is_preview: true,
        },
      },
    },
    orderBy: { position: "asc" },
  });
}

export async function createSection(actor: User, courseId: string, data: CreateSectionDto) {
  await getManagedCourse(actor, courseId);

  return prisma.course_section.create({
    data: {
      ...data,
      course_id: courseId,
    },
    select: sectionSelect,
  });
}

export async function updateSection(actor: User, sectionId: string, data: UpdateSectionDto) {
  const section = await prisma.course_section.findFirst({
    where: {
      id: sectionId,
      is_deleted: false,
    },
    select: {
      id: true,
      course_id: true,
    },
  });

  if (!section) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Section not found", { sectionId });
  }

  await getManagedCourse(actor, section.course_id);

  return prisma.course_section.update({
    where: { id: sectionId },
    data: data as Prisma.course_sectionUpdateInput,
    select: sectionSelect,
  });
}

export async function deleteSection(actor: User, sectionId: string) {
  const section = await prisma.course_section.findFirst({
    where: {
      id: sectionId,
      is_deleted: false,
    },
    select: {
      id: true,
      course_id: true,
    },
  });

  if (!section) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Section not found", { sectionId });
  }

  await getManagedCourse(actor, section.course_id);

  return prisma.course_section.update({
    where: { id: sectionId },
    data: {
      is_deleted: true,
      deleted_at: new Date(),
    } as Prisma.course_sectionUpdateInput,
    select: sectionSelect,
  });
}
