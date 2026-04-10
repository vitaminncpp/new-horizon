import { Prisma } from "@prisma/client";
import { prisma } from "@/src/infra/prisma/prisma.client";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";
import { CreateLessonDto, LessonProgressDto, UpdateLessonDto } from "@/src/infra/dtos/learning.dto";
import { User } from "@/src/infra/models/user.model";
import { getManagedCourse } from "@/src/services/learning-access.service";

const lessonSelect = {
  id: true,
  section_id: true,
  title: true,
  slug: true,
  description: true,
  type: true,
  position: true,
  estimated_minutes: true,
  is_preview: true,
  created_at: true,
  updated_at: true,
} as const;

export async function createLesson(actor: User, sectionId: string, data: CreateLessonDto) {
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

  return prisma.lesson.create({
    data: {
      ...data,
      section_id: sectionId,
    },
    select: lessonSelect,
  });
}

export async function getLessonDetail(lessonId: string, actor?: User) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      is_deleted: false,
    },
    select: {
      ...lessonSelect,
      section: {
        select: {
          id: true,
          title: true,
          position: true,
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              creator_id: true,
            },
          },
        },
      },
      content_blocks: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          type: true,
          title: true,
          content: true,
          position: true,
          created_at: true,
          updated_at: true,
        },
      },
      assessments: {
        where: {
          is_deleted: false,
          ...(actor?.role === "learner" || !actor ? { is_published: true } : {}),
        },
        select: {
          id: true,
          title: true,
          type: true,
          passing_score: true,
          max_attempts: true,
          time_limit_mins: true,
          is_published: true,
        },
      },
      coding_exercises: {
        where: {
          is_deleted: false,
        },
        select: {
          id: true,
          title: true,
          language: true,
          max_score: true,
          created_at: true,
          updated_at: true,
        },
      },
      progresses: actor
        ? {
            where: {
              user_id: actor.id,
            },
            select: {
              id: true,
              status: true,
              progress_percent: true,
              started_at: true,
              completed_at: true,
              last_interacted_at: true,
            },
          }
        : false,
    },
  });

  if (!lesson) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Lesson not found", { lessonId });
  }

  const isLearner = !actor || actor.role === "learner";
  if (
    isLearner &&
    lesson.section.course.status !== "published" &&
    actor?.id !== lesson.section.course.creator_id
  ) {
    throw new Exception(ErrorCode.FORBIDDEN, "Lesson is not available");
  }

  return lesson;
}

export async function updateLesson(actor: User, lessonId: string, data: UpdateLessonDto) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      is_deleted: false,
    },
    select: {
      id: true,
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

  return prisma.lesson.update({
    where: { id: lessonId },
    data: data as Prisma.lessonUpdateInput,
    select: lessonSelect,
  });
}

export async function deleteLesson(actor: User, lessonId: string) {
  const lesson = await prisma.lesson.findFirst({
    where: {
      id: lessonId,
      is_deleted: false,
    },
    select: {
      id: true,
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

  return prisma.lesson.update({
    where: { id: lessonId },
    data: {
      is_deleted: true,
      deleted_at: new Date(),
    } as Prisma.lessonUpdateInput,
    select: lessonSelect,
  });
}

export async function markLessonProgress(user: User, lessonId: string, payload: LessonProgressDto) {
  return prisma.$transaction(async (tx) => {
    const lesson = await tx.lesson.findFirst({
      where: {
        id: lessonId,
        is_deleted: false,
        section: {
          course: {
            is_deleted: false,
            status: "published",
          },
        },
      },
      select: {
        id: true,
        section: {
          select: {
            course_id: true,
            course: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Lesson not found", { lessonId });
    }

    const enrollment = await tx.course_enrollment.findUnique({
      where: {
        course_id_user_id: {
          course_id: lesson.section.course_id,
          user_id: user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!enrollment) {
      throw new Exception(ErrorCode.FORBIDDEN, "You must be enrolled to track lesson progress");
    }

    const now = new Date();
    const progressPercent =
      payload.progress_percent ??
      (payload.status === "completed" ? 100 : payload.status === "not_started" ? 0 : 50);

    await tx.lesson_progress.upsert({
      where: {
        lesson_id_user_id: {
          lesson_id: lessonId,
          user_id: user.id,
        },
      },
      update: {
        status: payload.status,
        progress_percent: new Prisma.Decimal(progressPercent),
        started_at: payload.status !== "not_started" ? now : null,
        completed_at: payload.status === "completed" ? now : null,
        last_interacted_at: now,
      },
      create: {
        lesson_id: lessonId,
        user_id: user.id,
        status: payload.status,
        progress_percent: new Prisma.Decimal(progressPercent),
        started_at: payload.status !== "not_started" ? now : null,
        completed_at: payload.status === "completed" ? now : null,
        last_interacted_at: now,
      },
    });

    const [totalLessons, completedLessons] = await Promise.all([
      tx.lesson.count({
        where: {
          is_deleted: false,
          section: {
            course_id: lesson.section.course_id,
          },
        },
      }),
      tx.lesson_progress.count({
        where: {
          user_id: user.id,
          status: "completed",
          lesson: {
            is_deleted: false,
            section: {
              course_id: lesson.section.course_id,
            },
          },
        },
      }),
    ]);

    const enrollmentProgress =
      totalLessons === 0 ? 0 : Number(((completedLessons / totalLessons) * 100).toFixed(2));
    const enrollmentStatus = enrollmentProgress >= 100 ? "completed" : "active";

    await tx.course_enrollment.update({
      where: {
        course_id_user_id: {
          course_id: lesson.section.course_id,
          user_id: user.id,
        },
      },
      data: {
        progress_percent: new Prisma.Decimal(enrollmentProgress),
        status: enrollmentStatus,
        completed_at: enrollmentStatus === "completed" ? now : null,
        last_accessed_at: now,
      },
    });

    return tx.lesson_progress.findUniqueOrThrow({
      where: {
        lesson_id_user_id: {
          lesson_id: lessonId,
          user_id: user.id,
        },
      },
    });
  });
}
