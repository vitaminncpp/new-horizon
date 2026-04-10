import { Prisma } from "@prisma/client";
import { prisma } from "@/src/infra/prisma/prisma.client";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";
import { CreateContentBlockDto, UpdateContentBlockDto } from "@/src/infra/dtos/learning.dto";
import { User } from "@/src/infra/models/user.model";
import { getManagedCourse } from "@/src/services/learning-access.service";

const contentBlockSelect = {
  id: true,
  lesson_id: true,
  type: true,
  title: true,
  content: true,
  position: true,
  created_at: true,
  updated_at: true,
} as const;

export async function createContentBlock(
  actor: User,
  lessonId: string,
  data: CreateContentBlockDto,
) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      is_deleted: false,
    },
    select: {
      section: {
        select: {
          course_id: true,
        },
      },
    },
  });

  if (!lesson) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Lesson not found", { lessonId });
  }

  await getManagedCourse(actor, lesson.section.course_id);

  return prisma.lesson_content_block.create({
    data: {
      lesson_id: lessonId,
      type: data.type,
      title: data.title,
      content: data.content as Prisma.InputJsonValue,
      position: data.position,
    },
    select: contentBlockSelect,
  });
}

export async function updateContentBlock(
  actor: User,
  blockId: string,
  data: UpdateContentBlockDto,
) {
  const block = await prisma.lesson_content_block.findUnique({
    where: { id: blockId },
    select: {
      lesson: {
        select: {
          section: {
            select: {
              course_id: true,
            },
          },
        },
      },
    },
  });

  if (!block) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Content block not found", { blockId });
  }

  await getManagedCourse(actor, block.lesson.section.course_id);

  const { content, ...rest } = data;

  return prisma.lesson_content_block.update({
    where: { id: blockId },
    data: {
      ...rest,
      ...(content ? { content: content as Prisma.InputJsonValue } : {}),
    } as Prisma.lesson_content_blockUpdateInput,
    select: contentBlockSelect,
  });
}

export async function deleteContentBlock(actor: User, blockId: string) {
  const block = await prisma.lesson_content_block.findUnique({
    where: { id: blockId },
    select: {
      lesson: {
        select: {
          section: {
            select: {
              course_id: true,
            },
          },
        },
      },
    },
  });

  if (!block) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Content block not found", { blockId });
  }

  await getManagedCourse(actor, block.lesson.section.course_id);

  await prisma.lesson_content_block.delete({
    where: { id: blockId },
  });

  return { success: true };
}
