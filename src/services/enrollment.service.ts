import { Prisma } from "@prisma/client";
import { prisma } from "@/src/infra/prisma/prisma.client";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";
import { User } from "@/src/infra/models/user.model";

export async function enrollInCourse(user: User, courseId: string) {
  return prisma.$transaction(async (tx) => {
    const course = await tx.course.findFirst({
      where: {
        id: courseId,
        is_deleted: false,
        status: "published",
      },
      select: {
        id: true,
      },
    });

    if (!course) {
      throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Course not found", { courseId });
    }

    const now = new Date();

    return tx.course_enrollment.upsert({
      where: {
        course_id_user_id: {
          course_id: courseId,
          user_id: user.id,
        },
      },
      update: {
        status: "active",
        completed_at: null,
        last_accessed_at: now,
      },
      create: {
        course_id: courseId,
        user_id: user.id,
        status: "active",
        progress_percent: new Prisma.Decimal(0),
        last_accessed_at: now,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            thumbnail_url: true,
            status: true,
          },
        },
      },
    });
  });
}

export async function listEnrolledCourses(user: User) {
  return prisma.course_enrollment.findMany({
    where: {
      user_id: user.id,
      course: {
        is_deleted: false,
      } as Prisma.courseWhereInput,
      status: {
        in: ["active", "completed", "paused"],
      },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          thumbnail_url: true,
          estimated_minutes: true,
          level: true,
          status: true,
          published_at: true,
          updated_at: true,
        },
      },
    },
    orderBy: [{ last_accessed_at: "desc" }, { updated_at: "desc" }],
  });
}

export async function getLearnerDashboard(user: User) {
  const [enrollments, recentProgress, attempts, submissions] = await Promise.all([
    prisma.course_enrollment.findMany({
      where: {
        user_id: user.id,
        course: {
          is_deleted: false,
        } as Prisma.courseWhereInput,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail_url: true,
            estimated_minutes: true,
            level: true,
          },
        },
      },
      orderBy: [{ last_accessed_at: "desc" }, { updated_at: "desc" }],
      take: 5,
    }),
    prisma.lesson_progress.findMany({
      where: {
        user_id: user.id,
        lesson: {
          is_deleted: false,
          section: {
            course: {
              is_deleted: false,
            } as Prisma.courseWhereInput,
          },
        },
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            section: {
              select: {
                title: true,
                course: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [{ last_interacted_at: "desc" }, { updated_at: "desc" }],
      take: 10,
    }),
    prisma.assessment_attempt.findMany({
      where: {
        user_id: user.id,
        assessment: {
          is_deleted: false,
        } as Prisma.assessmentWhereInput,
      },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            type: true,
            course: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: [{ updated_at: "desc" }],
      take: 5,
    }),
    prisma.exercise_submission.findMany({
      where: {
        user_id: user.id,
        coding_exercise: {
          is_deleted: false,
        } as Prisma.coding_exerciseWhereInput,
      },
      include: {
        coding_exercise: {
          select: {
            id: true,
            title: true,
            language: true,
          },
        },
      },
      orderBy: [{ updated_at: "desc" }],
      take: 5,
    }),
  ]);

  return {
    enrollments,
    recentProgress,
    attempts,
    submissions,
  };
}
