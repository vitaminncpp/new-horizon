import { Prisma } from "@prisma/client";
import { prisma } from "@/src/infra/prisma/prisma.client";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";
import { CreateCourseDto, UpdateCourseDto } from "@/src/infra/dtos/course.dto";
import { User } from "@/src/infra/models/user.model";
import { assertCourseManagerRole, getManagedCourse } from "@/src/services/learning-access.service";

const courseSummarySelect = {
  id: true,
  creator_id: true,
  title: true,
  slug: true,
  summary: true,
  description: true,
  thumbnail_url: true,
  estimated_minutes: true,
  level: true,
  status: true,
  published_at: true,
  created_at: true,
  updated_at: true,
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  _count: {
    select: {
      sections: true,
      enrollments: true,
      assessments: true,
    },
  },
} as const;

type CourseListFilters = {
  actor?: User;
  status?: "draft" | "published" | "archived";
  creatorId?: string;
  enrolled?: boolean;
};

export async function listCourses(filters: CourseListFilters = {}) {
  const where: Prisma.courseWhereInput = {
    is_deleted: false,
  };

  if (filters.status) {
    where.status = filters.status;
  } else if (!filters.actor || filters.actor.role === "learner") {
    where.status = "published";
  }

  if (filters.creatorId) {
    where.creator_id = filters.creatorId;
  }

  if (filters.enrolled && filters.actor) {
    where.enrollments = {
      some: {
        user_id: filters.actor.id,
        status: {
          in: ["active", "completed", "paused"],
        },
      },
    };
  }

  return prisma.course.findMany({
    where,
    select: {
      ...courseSummarySelect,
      enrollments: filters.actor
        ? {
            where: {
              user_id: filters.actor.id,
            },
            select: {
              id: true,
              status: true,
              progress_percent: true,
              enrolled_at: true,
              completed_at: true,
              last_accessed_at: true,
            },
          }
        : false,
    },
    orderBy: [{ published_at: "desc" }, { created_at: "desc" }],
  });
}

export async function getCourseDetail(courseId: string, actor?: User) {
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      is_deleted: false,
      ...(actor?.role === "learner" || !actor ? { status: "published" } : {}),
    },
    select: {
      ...courseSummarySelect,
      sections: {
        where: {
          is_deleted: false,
        },
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          position: true,
          created_at: true,
          updated_at: true,
          lessons: {
            where: {
              is_deleted: false,
            },
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
              title: true,
              slug: true,
              description: true,
              type: true,
              position: true,
              estimated_minutes: true,
              is_preview: true,
              created_at: true,
              updated_at: true,
              progresses: actor
                ? {
                    where: {
                      user_id: actor.id,
                    },
                    select: {
                      status: true,
                      progress_percent: true,
                      completed_at: true,
                      last_interacted_at: true,
                    },
                  }
                : false,
            },
          },
        },
      },
      enrollments: actor
        ? {
            where: {
              user_id: actor.id,
            },
            select: {
              id: true,
              status: true,
              progress_percent: true,
              enrolled_at: true,
              completed_at: true,
              last_accessed_at: true,
            },
          }
        : false,
    },
  });

  if (!course) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Course not found", { courseId });
  }

  return course;
}

export async function createCourse(actor: User, data: CreateCourseDto) {
  assertCourseManagerRole(actor);

  return prisma.course.create({
    data: {
      ...data,
      creator_id: actor.id,
      published_at: data.status === "published" ? new Date() : null,
    },
    select: courseSummarySelect,
  });
}

export async function updateCourse(actor: User, courseId: string, data: UpdateCourseDto) {
  const course = await getManagedCourse(actor, courseId);
  const nextStatus = data.status ?? course.status;

  return prisma.course.update({
    where: { id: courseId },
    data: {
      ...data,
      published_at:
        nextStatus === "published"
          ? data.status === "published"
            ? new Date()
            : undefined
          : nextStatus === "draft" || nextStatus === "archived"
            ? null
            : undefined,
    } as Prisma.courseUpdateInput,
    select: courseSummarySelect,
  });
}

export async function deleteCourse(actor: User, courseId: string) {
  await getManagedCourse(actor, courseId);

  return prisma.course.update({
    where: { id: courseId },
    data: {
      is_deleted: true,
      deleted_at: new Date(),
    } as Prisma.courseUpdateInput,
    select: courseSummarySelect,
  });
}
