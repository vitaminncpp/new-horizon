import { Prisma } from "@prisma/client";
import { prisma } from "@/src/infra/prisma/prisma.client";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";
import { CreateQuestionDto, UpdateQuestionDto } from "@/src/infra/dtos/learning.dto";
import { User } from "@/src/infra/models/user.model";
import { getManagedCourse } from "@/src/services/learning-access.service";

const questionSelect = {
  id: true,
  assessment_id: true,
  prompt: true,
  type: true,
  position: true,
  points: true,
  explanation: true,
  correct_text_answer: true,
  code_template: true,
  code_language: true,
  metadata: true,
  created_at: true,
  updated_at: true,
  options: {
    orderBy: {
      position: "asc",
    },
    select: {
      id: true,
      label: true,
      content: true,
      position: true,
      is_correct: true,
      created_at: true,
      updated_at: true,
    },
  },
} as const;

export async function createQuestion(actor: User, assessmentId: string, data: CreateQuestionDto) {
  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      is_deleted: false,
    },
    select: {
      course_id: true,
    },
  });

  if (!assessment) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Assessment not found", { assessmentId });
  }

  await getManagedCourse(actor, assessment.course_id);

  return prisma.assessment_question.create({
    data: {
      assessment_id: assessmentId,
      prompt: data.prompt,
      type: data.type,
      position: data.position,
      points: data.points ?? 1,
      explanation: data.explanation,
      correct_text_answer: data.correct_text_answer,
      code_template: data.code_template,
      code_language: data.code_language,
      ...(data.metadata ? { metadata: data.metadata as Prisma.InputJsonValue } : {}),
      options: data.options
        ? {
            create: data.options.map((option) => ({
              label: option.label,
              content: option.content,
              position: option.position,
              is_correct: option.is_correct ?? false,
            })),
          }
        : undefined,
    },
    select: questionSelect,
  });
}

export async function updateQuestion(actor: User, questionId: string, data: UpdateQuestionDto) {
  const question = await prisma.assessment_question.findUnique({
    where: { id: questionId },
    select: {
      assessment: {
        select: {
          course_id: true,
        },
      },
    },
  });

  if (!question) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Question not found", { questionId });
  }

  await getManagedCourse(actor, question.assessment.course_id);

  const { metadata, options, ...rest } = data;

  return prisma.$transaction(async (tx) => {
    if (options) {
      await tx.question_option.deleteMany({
        where: {
          question_id: questionId,
        },
      });
    }

    return tx.assessment_question.update({
      where: { id: questionId },
      data: {
        ...rest,
        ...(metadata ? { metadata: metadata as Prisma.InputJsonValue } : {}),
        ...(options
          ? {
              options: {
                create: options.map((option) => ({
                  label: option.label,
                  content: option.content,
                  position: option.position,
                  is_correct: option.is_correct ?? false,
                })),
              },
            }
          : {}),
      } as Prisma.assessment_questionUpdateInput,
      select: questionSelect,
    });
  });
}

export async function deleteQuestion(actor: User, questionId: string) {
  const question = await prisma.assessment_question.findUnique({
    where: { id: questionId },
    select: {
      assessment: {
        select: {
          course_id: true,
        },
      },
    },
  });

  if (!question) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Question not found", { questionId });
  }

  await getManagedCourse(actor, question.assessment.course_id);

  await prisma.assessment_question.delete({
    where: { id: questionId },
  });

  return { success: true };
}
