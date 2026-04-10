import { Prisma } from "@prisma/client";
import { prisma } from "@/src/infra/prisma/prisma.client";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";
import {
  CreateAssessmentDto,
  GradeAssessmentAttemptDto,
  SubmitAssessmentDto,
  UpdateAssessmentDto,
} from "@/src/infra/dtos/learning.dto";
import { User } from "@/src/infra/models/user.model";
import { getManagedCourse } from "@/src/services/learning-access.service";

const assessmentSelect = {
  id: true,
  course_id: true,
  lesson_id: true,
  title: true,
  description: true,
  type: true,
  passing_score: true,
  max_attempts: true,
  time_limit_mins: true,
  is_published: true,
  created_at: true,
  updated_at: true,
} as const;

export async function createAssessment(actor: User, courseId: string, data: CreateAssessmentDto) {
  await getManagedCourse(actor, courseId);

  return prisma.assessment.create({
    data: {
      ...data,
      course_id: courseId,
    },
    select: assessmentSelect,
  });
}

export async function getAssessmentDetail(assessmentId: string, actor?: User) {
  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      is_deleted: false,
      ...(actor?.role === "learner" || !actor ? { is_published: true } : {}),
    },
    select: {
      ...assessmentSelect,
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          creator_id: true,
        },
      },
      questions: {
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
          prompt: true,
          type: true,
          position: true,
          points: true,
          explanation: actor && actor.role !== "learner",
          correct_text_answer: actor && actor.role !== "learner",
          code_template: true,
          code_language: true,
          metadata: true,
          options: {
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
              label: true,
              content: true,
              position: true,
              is_correct: actor && actor.role !== "learner",
            },
          },
        },
      },
    },
  });

  if (!assessment) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Assessment not found", { assessmentId });
  }

  const isLearner = !actor || actor.role === "learner";
  if (isLearner && assessment.course.status !== "published" && actor?.id !== assessment.course.creator_id) {
    throw new Exception(ErrorCode.FORBIDDEN, "Assessment is not available");
  }

  return assessment;
}

export async function updateAssessment(actor: User, assessmentId: string, data: UpdateAssessmentDto) {
  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      is_deleted: false,
    },
    select: {
      id: true,
      course_id: true,
    },
  });

  if (!assessment) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Assessment not found", { assessmentId });
  }

  await getManagedCourse(actor, assessment.course_id);

  return prisma.assessment.update({
    where: { id: assessmentId },
    data: data as Prisma.assessmentUpdateInput,
    select: assessmentSelect,
  });
}

export async function deleteAssessment(actor: User, assessmentId: string) {
  const assessment = await prisma.assessment.findFirst({
    where: {
      id: assessmentId,
      is_deleted: false,
    },
    select: {
      id: true,
      course_id: true,
    },
  });

  if (!assessment) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Assessment not found", { assessmentId });
  }

  await getManagedCourse(actor, assessment.course_id);

  return prisma.assessment.update({
    where: { id: assessmentId },
    data: {
      is_deleted: true,
      deleted_at: new Date(),
    } as Prisma.assessmentUpdateInput,
    select: assessmentSelect,
  });
}

export async function submitAssessmentAttempt(user: User, assessmentId: string, payload: SubmitAssessmentDto) {
  return prisma.$transaction(async (tx) => {
    const assessment = await tx.assessment.findFirst({
      where: {
        id: assessmentId,
        is_deleted: false,
        is_published: true,
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
      select: {
        id: true,
        passing_score: true,
        max_attempts: true,
        questions: {
          orderBy: {
            position: "asc",
          },
          select: {
            id: true,
            type: true,
            points: true,
            correct_text_answer: true,
            options: {
              where: {
                is_correct: true,
              },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Assessment not found", { assessmentId });
    }

    const previousAttempts = await tx.assessment_attempt.count({
      where: {
        assessment_id: assessmentId,
        user_id: user.id,
      },
    });

    if (assessment.max_attempts && previousAttempts >= assessment.max_attempts) {
      throw new Exception(ErrorCode.FORBIDDEN, "Maximum assessment attempts reached");
    }

    const answerMap = new Map(payload.answers.map((answer) => [answer.question_id, answer]));
    const totalPoints = assessment.questions.reduce((sum, question) => sum + question.points, 0);
    let earnedPoints = 0;

    const attempt = await tx.assessment_attempt.create({
      data: {
        assessment_id: assessmentId,
        user_id: user.id,
        attempt_number: previousAttempts + 1,
        status: "submitted",
        submitted_at: new Date(),
      },
    });

    for (const question of assessment.questions) {
      const submittedAnswer = answerMap.get(question.id);
      const result = evaluateAnswer(question, submittedAnswer);
      earnedPoints += result.scoreAwarded;

      await tx.attempt_answer.create({
        data: {
          assessment_attempt_id: attempt.id,
          question_id: question.id,
          ...(submittedAnswer?.selected_option_ids
            ? {
                selected_option_ids: submittedAnswer.selected_option_ids as Prisma.InputJsonValue,
              }
            : {}),
          text_answer: submittedAnswer?.text_answer,
          code_answer: submittedAnswer?.code_answer,
          is_correct: result.isCorrect,
          score_awarded: new Prisma.Decimal(result.scoreAwarded),
          feedback: result.feedback,
        },
      });
    }

    const score = totalPoints === 0 ? 0 : Number(((earnedPoints / totalPoints) * 100).toFixed(2));

    const updatedAttempt = await tx.assessment_attempt.update({
      where: { id: attempt.id },
      data: {
        status: "graded",
        score: new Prisma.Decimal(score),
        graded_at: new Date(),
      },
      include: {
        answers: true,
      },
    });

    return {
      ...updatedAttempt,
      passed: assessment.passing_score ? score >= assessment.passing_score : true,
    };
  });
}

export async function gradeAssessmentAttempt(
  actor: User,
  attemptId: string,
  payload: GradeAssessmentAttemptDto,
) {
  return prisma.$transaction(async (tx) => {
    const attempt = await tx.assessment_attempt.findUnique({
      where: { id: attemptId },
      select: {
        id: true,
        assessment_id: true,
        assessment: {
          select: {
            course_id: true,
            questions: {
              select: {
                id: true,
                points: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Assessment attempt not found", { attemptId });
    }

    await getManagedCourse(actor, attempt.assessment.course_id);

    for (const answer of payload.answers) {
      await tx.attempt_answer.updateMany({
        where: {
          assessment_attempt_id: attemptId,
          question_id: answer.question_id,
        },
        data: {
          is_correct: answer.is_correct,
          score_awarded:
            typeof answer.score_awarded === "number"
              ? new Prisma.Decimal(answer.score_awarded)
              : undefined,
          feedback: answer.feedback,
        },
      });
    }

    const gradedAnswers = await tx.attempt_answer.findMany({
      where: {
        assessment_attempt_id: attemptId,
      },
      select: {
        question_id: true,
        score_awarded: true,
      },
    });

    const totalPoints = attempt.assessment.questions.reduce((sum, question) => sum + question.points, 0);
    const earnedPoints = gradedAnswers.reduce((sum, answer) => sum + Number(answer.score_awarded ?? 0), 0);
    const score = totalPoints === 0 ? 0 : Number(((earnedPoints / totalPoints) * 100).toFixed(2));

    return tx.assessment_attempt.update({
      where: { id: attemptId },
      data: {
        status: "graded",
        score: new Prisma.Decimal(score),
        graded_at: new Date(),
      },
      include: {
        answers: true,
      },
    });
  });
}

function evaluateAnswer(
  question: {
    id: string;
    type: "single_choice" | "multiple_choice" | "short_text" | "code";
    points: number;
    correct_text_answer: string | null;
    options: Array<{ id: string }>;
  },
  submittedAnswer?: {
    selected_option_ids?: string[];
    text_answer?: string;
    code_answer?: string;
  },
) {
  if (!submittedAnswer) {
    return {
      isCorrect: false,
      scoreAwarded: 0,
      feedback: "No answer submitted",
    };
  }

  if (question.type === "single_choice" || question.type === "multiple_choice") {
    const expected = [...question.options.map((option) => option.id)].sort();
    const actual = [...(submittedAnswer.selected_option_ids ?? [])].sort();
    const isCorrect = expected.length === actual.length && expected.every((value, index) => value === actual[index]);
    return {
      isCorrect,
      scoreAwarded: isCorrect ? question.points : 0,
      feedback: isCorrect ? "Correct answer" : "Selected options did not match the expected answer",
    };
  }

  if (question.type === "short_text") {
    const expected = normalizeText(question.correct_text_answer);
    const actual = normalizeText(submittedAnswer.text_answer);
    const isCorrect = Boolean(expected && actual && expected === actual);
    return {
      isCorrect,
      scoreAwarded: isCorrect ? question.points : 0,
      feedback: isCorrect ? "Correct answer" : "Short answer requires review",
    };
  }

  return {
    isCorrect: null,
    scoreAwarded: 0,
    feedback: submittedAnswer.code_answer ? "Code answer submitted for review" : "No code submitted",
  };
}

function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() ?? "";
}
