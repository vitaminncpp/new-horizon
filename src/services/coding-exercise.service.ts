import { Prisma } from "@prisma/client";
import { prisma } from "@/src/infra/prisma/prisma.client";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";
import {
  CreateCodingExerciseDto,
  CreateSubmissionDto,
  UpdateCodingExerciseDto,
} from "@/src/infra/dtos/learning.dto";
import { User } from "@/src/infra/models/user.model";
import { getManagedCourse } from "@/src/services/learning-access.service";

const codingExerciseSelect = {
  id: true,
  lesson_id: true,
  title: true,
  prompt: true,
  starter_code: true,
  solution_code: true,
  language: true,
  test_cases: true,
  max_score: true,
  created_at: true,
  updated_at: true,
} as const;

export async function createCodingExercise(
  actor: User,
  lessonId: string,
  data: CreateCodingExerciseDto,
) {
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

  const { test_cases, ...exerciseData } = data;

  return prisma.coding_exercise.create({
    data: {
      ...exerciseData,
      lesson_id: lessonId,
      ...(test_cases ? { test_cases: test_cases as Prisma.InputJsonValue } : {}),
    } as Prisma.coding_exerciseUncheckedCreateInput,
    select: codingExerciseSelect,
  });
}

export async function getCodingExerciseDetail(exerciseId: string, actor?: User) {
  const exercise = await prisma.coding_exercise.findFirst({
    where: {
      id: exerciseId,
      is_deleted: false,
    },
    select: {
      ...codingExerciseSelect,
      lesson: {
        select: {
          id: true,
          title: true,
          slug: true,
          section: {
            select: {
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
        },
      },
      submissions: actor
        ? {
            where: {
              user_id: actor.id,
            },
            orderBy: { submission_number: "desc" },
            select: {
              id: true,
              submission_number: true,
              language: true,
              status: true,
              score: true,
              test_results: true,
              submitted_at: true,
              created_at: true,
              updated_at: true,
            },
          }
        : false,
    },
  });

  if (!exercise) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Coding exercise not found", { exerciseId });
  }

  const isLearner = !actor || actor.role === "learner";
  if (
    isLearner &&
    exercise.lesson.section.course.status !== "published" &&
    actor?.id !== exercise.lesson.section.course.creator_id
  ) {
    throw new Exception(ErrorCode.FORBIDDEN, "Coding exercise is not available");
  }

  return exercise;
}

export async function updateCodingExercise(
  actor: User,
  exerciseId: string,
  data: UpdateCodingExerciseDto,
) {
  const exercise = await prisma.coding_exercise.findFirst({
    where: {
      id: exerciseId,
      is_deleted: false,
    },
    select: {
      id: true,
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

  if (!exercise) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Coding exercise not found", { exerciseId });
  }

  await getManagedCourse(actor, exercise.lesson.section.course_id);

  const { test_cases, ...exerciseData } = data;

  return prisma.coding_exercise.update({
    where: { id: exerciseId },
    data: {
      ...exerciseData,
      ...(test_cases ? { test_cases: test_cases as Prisma.InputJsonValue } : {}),
    } as Prisma.coding_exerciseUpdateInput,
    select: codingExerciseSelect,
  });
}

export async function deleteCodingExercise(actor: User, exerciseId: string) {
  const exercise = await prisma.coding_exercise.findFirst({
    where: {
      id: exerciseId,
      is_deleted: false,
    },
    select: {
      id: true,
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

  if (!exercise) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Coding exercise not found", { exerciseId });
  }

  await getManagedCourse(actor, exercise.lesson.section.course_id);

  return prisma.coding_exercise.update({
    where: { id: exerciseId },
    data: {
      is_deleted: true,
      deleted_at: new Date(),
    } as Prisma.coding_exerciseUpdateInput,
    select: codingExerciseSelect,
  });
}

export async function createSubmission(user: User, exerciseId: string, data: CreateSubmissionDto) {
  return prisma.$transaction(async (tx) => {
    const exercise = await tx.coding_exercise.findFirst({
      where: {
        id: exerciseId,
        is_deleted: false,
        lesson: {
          is_deleted: false,
          section: {
            course: {
              is_deleted: false,
              enrollments: {
                some: {
                  user_id: user.id,
                  status: {
                    in: ["active", "completed", "paused"],
                  },
                },
              },
            },
          },
        },
      },
      select: {
        id: true,
        max_score: true,
      },
    });

    if (!exercise) {
      throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Coding exercise not found", {
        exerciseId,
      });
    }

    const submissionCount = await tx.exercise_submission.count({
      where: {
        coding_exercise_id: exerciseId,
        user_id: user.id,
      },
    });

    return tx.exercise_submission.create({
      data: {
        coding_exercise_id: exerciseId,
        user_id: user.id,
        submission_number: submissionCount + 1,
        code: data.code,
        language: data.language,
        status: data.status,
        score:
          typeof data.score === "number"
            ? new Prisma.Decimal(Math.min(data.score, exercise.max_score))
            : null,
        ...(data.test_results
          ? {
              test_results: data.test_results as Prisma.InputJsonValue,
            }
          : {}),
        submitted_at:
          data.status === "submitted" || data.status === "passed" || data.status === "failed"
            ? new Date()
            : null,
      },
      include: {
        coding_exercise: {
          select: {
            id: true,
            title: true,
            language: true,
            max_score: true,
          },
        },
      },
    });
  });
}
