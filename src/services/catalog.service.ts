import { Prisma } from "@prisma/client";
import { prisma } from "@/src/infra/prisma/prisma.client";
import type {
  CourseDto,
  CourseLessonsDto,
  DashboardResponseDto,
  ProgressSummaryDto,
} from "@/src/infra/dtos/course.dto";
import type {
  AssessmentAttemptDto,
  AssessmentDto,
  AssessmentQuestionDto,
  CodingExerciseDto,
  ContentBlockDto,
  EnrollmentDto,
  LessonDetailDto,
  LessonProgressDto,
  SectionDto,
} from "@/src/infra/dtos/learning.dto";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";

type Viewer = { id: string } | null;

export type CourseSort = "popular" | "latest" | "rating";

export type CourseDurationFilter = "0-2" | "3-6" | "7-plus";

export type ListCoursesFilters = {
  search?: string;
  categories?: string[];
  difficulty?: CourseDto["difficulty"];
  duration?: CourseDurationFilter;
  sort?: CourseSort;
  page?: number;
  pageSize?: number;
};

const courseInclude = Prisma.validator<Prisma.courseInclude>()({
  creator: true,
  instructors: {
    where: { is_primary: true },
    include: {
      instructor: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: [{ is_primary: "desc" }, { sort_order: "asc" }],
    take: 1,
  },
  enrollments: true,
  sections: {
    include: {
      lessons: true,
    },
  },
  reviews: true,
});

type DbCourse = Prisma.courseGetPayload<{
  include: typeof courseInclude;
}>;

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function mapCourse(course: DbCourse, viewerId?: string): CourseDto {
  const enrollment = viewerId
    ? course.enrollments.find((item) => item.user_id === viewerId)
    : undefined;
  const instructor = course.instructors[0]?.instructor ?? course.creator;
  const rating =
    course.reviews.length > 0
      ? Number(
          (
            course.reviews.reduce((sum, review) => sum + review.rating, 0) / course.reviews.length
          ).toFixed(1),
        )
      : 4.8;
  const lessonCount = course.sections.reduce((sum, section) => sum + section.lessons.length, 0);
  const durationHours =
    course.estimated_hours ?? Math.max(1, Math.ceil((course.estimated_minutes ?? 60) / 60));

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    category: course.category ?? "General",
    difficulty: titleCase(course.level) as CourseDto["difficulty"],
    durationHours,
    rating,
    reviews: course.reviews.length,
    tag: course.is_featured
      ? enrollment
        ? "Current Path"
        : "Featured"
      : enrollment
        ? "Enrolled"
        : "Curated",
    badge: (course.category ?? "GENERAL").toUpperCase(),
    summary: course.summary ?? course.description ?? "",
    description: course.description ?? course.summary ?? "",
    instructor: instructor.name,
    instructorTitle:
      instructor.profile?.headline ?? instructor.profile?.major ?? "Course Instructor",
    thumbnail: course.thumbnail_url ?? course.hero_image_url ?? "",
    heroImage: course.hero_image_url ?? course.thumbnail_url ?? "",
    accent: course.accent_gradient ?? "from-[#00C9A7] to-[#4D96FF]",
    progress: enrollment?.progress_percent ?? 0,
    modules: course.sections.length,
    lessons: lessonCount,
    hoursLabel: `${durationHours}h of learning content`,
    language: course.language ?? "English",
    enrolled: Boolean(enrollment),
    featured: course.is_featured,
  };
}

export async function listCourses(viewer: Viewer = null, filters: ListCoursesFilters = {}) {
  const items = await prisma.course.findMany({
    where: buildCourseWhere(filters),
    include: courseInclude,
    orderBy: [{ is_featured: "desc" }, { created_at: "desc" }],
  });

  const filteredItems = items
    .map((item) => mapCourse(item, viewer?.id))
    .filter((course) => matchesDuration(course, filters.duration))
    .sort((a, b) => sortCourses(a, b, filters.sort));

  if (!filters.page || !filters.pageSize) {
    return filteredItems;
  }

  const page = Math.max(1, filters.page);
  const pageSize = Math.max(1, filters.pageSize);
  const start = (page - 1) * pageSize;

  return filteredItems.slice(start, start + pageSize);
}

export async function listCoursesWithMeta(viewer: Viewer = null, filters: ListCoursesFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.max(1, filters.pageSize ?? 6);
  const items = await listCourses(viewer, { ...filters, page: undefined, pageSize: undefined });
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    meta: {
      page: currentPage,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}

function buildCourseWhere(filters: ListCoursesFilters): Prisma.courseWhereInput {
  const where: Prisma.courseWhereInput = { status: "published" };
  const search = filters.search?.trim();
  const categories = filters.categories?.filter((category) => category !== "All");

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { summary: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      {
        creator: {
          name: { contains: search, mode: "insensitive" },
        },
      },
      {
        instructors: {
          some: {
            instructor: {
              name: { contains: search, mode: "insensitive" },
            },
          },
        },
      },
    ];
  }

  if (categories && categories.length > 0) {
    where.category = { in: categories };
  }

  if (filters.difficulty) {
    where.level = filters.difficulty.toLowerCase() as Prisma.EnumCourseLevelFilter["equals"];
  }

  return where;
}

function matchesDuration(course: CourseDto, duration?: CourseDurationFilter) {
  if (!duration) {
    return true;
  }

  if (duration === "0-2") {
    return course.durationHours <= 2;
  }

  if (duration === "3-6") {
    return course.durationHours >= 3 && course.durationHours <= 6;
  }

  return course.durationHours >= 7;
}

function sortCourses(a: CourseDto, b: CourseDto, sort: CourseSort = "popular") {
  if (sort === "latest") {
    return 0;
  }

  if (sort === "rating") {
    return b.rating - a.rating || b.reviews - a.reviews;
  }

  return Number(b.featured) - Number(a.featured) || b.reviews - a.reviews || b.rating - a.rating;
}

export async function getCourse(courseId: string, viewer: Viewer = null) {
  const item = await prisma.course.findFirst({
    where: {
      OR: [{ id: courseId }, { slug: courseId }],
      status: "published",
    },
    include: courseInclude,
  });

  if (!item) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Course not found", { courseId });
  }

  return mapCourse(item, viewer?.id);
}

export async function getCourseSections(courseId: string): Promise<SectionDto[]> {
  const items = await prisma.section.findMany({
    where: {
      course: {
        OR: [{ id: courseId }, { slug: courseId }],
      },
    },
    include: {
      lessons: {
        where: { status: "published" },
      },
    },
    orderBy: { position: "asc" },
  });

  return items.map((item) => ({
    id: item.id,
    courseId: item.course_id,
    title: item.title,
    slug: item.slug,
    description: item.description,
    position: item.position,
    estimatedMinutes: item.estimated_minutes,
    lessonCount: item.lessons.length,
  }));
}

export async function getCourseLessons(
  courseId: string,
  viewer: Viewer = null,
): Promise<CourseLessonsDto> {
  const sections = await prisma.section.findMany({
    where: {
      course: {
        OR: [{ id: courseId }, { slug: courseId }],
      },
    },
    include: {
      lessons: {
        where: { status: "published" },
        include: {
          progress_records: viewer
            ? {
                where: { user_id: viewer.id },
              }
            : false,
        },
        orderBy: { position: "asc" },
      },
    },
    orderBy: { position: "asc" },
  });

  if (sections.length === 0) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Lessons not found", { courseId });
  }

  return {
    courseId,
    modules: sections.map((section) => ({
      id: section.id,
      title: section.title,
      completed: section.lessons.filter((lesson) =>
        lesson.progress_records?.some((progress) => progress.status === "completed"),
      ).length,
      total: section.lessons.length,
      items: section.lessons.map((lesson) => {
        const progress = lesson.progress_records?.[0];
        return {
          id: lesson.id,
          title: lesson.title,
          duration: `${String(lesson.estimated_minutes ?? 5).padStart(2, "0")}:00`,
          status:
            progress?.status === "completed"
              ? "complete"
              : progress?.status === "in_progress"
                ? "current"
                : "locked",
          type: lesson.lesson_type === "quiz" ? "quiz" : "video",
        };
      }),
    })),
  };
}

function mapProgress(
  progress: Prisma.lesson_progressGetPayload<Record<string, never>>,
): LessonProgressDto {
  return {
    id: progress.id,
    lessonId: progress.lesson_id,
    userId: progress.user_id,
    status: progress.status,
    progressPercent: progress.progress_percent,
    watchPositionSeconds: progress.watch_position_seconds,
    startedAt: progress.started_at?.toISOString() ?? null,
    completedAt: progress.completed_at?.toISOString() ?? null,
    lastViewedAt: progress.last_viewed_at?.toISOString() ?? null,
  };
}

function mapContentBlock(
  block: Prisma.content_blockGetPayload<Record<string, never>>,
): ContentBlockDto {
  return {
    id: block.id,
    lessonId: block.lesson_id,
    type: block.block_type,
    title: block.title,
    position: block.position,
    markdownContent: block.markdown_content,
    richTextJson: block.rich_text_json,
    codeLanguage: block.code_language,
    codeContent: block.code_content,
    assetUrl: block.asset_url,
    metadataJson: block.metadata_json,
  };
}

function mapQuestion(
  question: Prisma.assessment_questionGetPayload<Record<string, never>>,
): AssessmentQuestionDto {
  return {
    id: question.id,
    assessmentId: question.assessment_id,
    prompt: question.prompt,
    explanation: question.explanation,
    type: question.question_type,
    position: question.position,
    points: question.points,
    optionsJson: question.options_json,
  };
}

type DbAssessment = Prisma.assessmentGetPayload<{
  include: {
    questions: true;
  };
}>;

function mapAssessment(assessment: DbAssessment): AssessmentDto {
  return {
    id: assessment.id,
    courseId: assessment.course_id,
    sectionId: assessment.section_id,
    lessonId: assessment.lesson_id,
    title: assessment.title,
    description: assessment.description,
    type: assessment.assessment_type,
    position: assessment.position,
    passingScore: assessment.passing_score,
    maxAttempts: assessment.max_attempts,
    isPublished: assessment.is_published,
    questions: assessment.questions.map(mapQuestion),
  };
}

function mapCodingExercise(
  exercise: Prisma.coding_exerciseGetPayload<Record<string, never>>,
): CodingExerciseDto {
  return {
    id: exercise.id,
    lessonId: exercise.lesson_id,
    title: exercise.title,
    slug: exercise.slug,
    instructions: exercise.instructions,
    language: exercise.language,
    difficulty: exercise.difficulty,
    position: exercise.position,
    starterCode: exercise.starter_code,
    testCasesJson: exercise.test_cases_json,
  };
}

export async function getLesson(lessonId: string, viewer: Viewer = null): Promise<LessonDetailDto> {
  const item = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      section: true,
      content_blocks: {
        orderBy: { position: "asc" },
      },
      progress_records: viewer
        ? {
            where: { user_id: viewer.id },
          }
        : false,
      assessments: {
        include: {
          questions: {
            orderBy: { position: "asc" },
          },
        },
      },
      coding_exercises: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!item) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Lesson not found", { lessonId });
  }

  return {
    id: item.id,
    sectionId: item.section_id,
    courseId: item.section.course_id,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    lessonType: item.lesson_type,
    status: item.status,
    position: item.position,
    estimatedMinutes: item.estimated_minutes,
    isPreview: item.is_preview,
    videoUrl: item.video_url,
    coverImageUrl: item.cover_image_url,
    transcript: item.transcript,
    resourcesJson: item.resources_json,
    progress: item.progress_records?.[0] ? mapProgress(item.progress_records[0]) : undefined,
    contentBlocks: item.content_blocks.map(mapContentBlock),
    assessments: item.assessments.map(mapAssessment),
    codingExercises: item.coding_exercises.map(mapCodingExercise),
  };
}

export async function getLessonProgress(lessonId: string, userId: string) {
  const item = await prisma.lesson_progress.findUnique({
    where: {
      lesson_id_user_id: {
        lesson_id: lessonId,
        user_id: userId,
      },
    },
  });

  return item ? mapProgress(item) : null;
}

export async function getLessonContentBlocks(lessonId: string) {
  const items = await prisma.content_block.findMany({
    where: { lesson_id: lessonId },
    orderBy: { position: "asc" },
  });

  return items.map(mapContentBlock);
}

export async function getLessonCodingExercises(lessonId: string) {
  const items = await prisma.coding_exercise.findMany({
    where: { lesson_id: lessonId },
    orderBy: { position: "asc" },
  });

  return items.map(mapCodingExercise);
}

export async function getAssessmentsByCourse(courseId: string) {
  const items = await prisma.assessment.findMany({
    where: {
      course: {
        OR: [{ id: courseId }, { slug: courseId }],
      },
      is_published: true,
    },
    include: {
      questions: {
        orderBy: { position: "asc" },
      },
    },
    orderBy: { position: "asc" },
  });

  return items.map(mapAssessment);
}

export async function getAssessment(assessmentId: string) {
  const item = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      questions: {
        orderBy: { position: "asc" },
      },
    },
  });

  if (!item) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Assessment not found", { assessmentId });
  }

  return mapAssessment(item);
}

export async function getAssessmentQuestions(assessmentId: string) {
  const items = await prisma.assessment_question.findMany({
    where: { assessment_id: assessmentId },
    orderBy: { position: "asc" },
  });

  return items.map(mapQuestion);
}

export async function getAssessmentAttempts(
  assessmentId: string,
  userId: string,
): Promise<AssessmentAttemptDto[]> {
  const items = await prisma.assessment_attempt.findMany({
    where: { assessment_id: assessmentId, user_id: userId },
    orderBy: { created_at: "desc" },
  });

  return items.map((item) => ({
    id: item.id,
    assessmentId: item.assessment_id,
    userId: item.user_id,
    status: item.status,
    score: item.score,
    maxScore: item.max_score,
    startedAt: item.started_at.toISOString(),
    submittedAt: item.submitted_at?.toISOString() ?? null,
    gradedAt: item.graded_at?.toISOString() ?? null,
    feedback: item.feedback,
    answersJson: item.answers_json,
  }));
}

export async function getEnrollments(userId: string): Promise<EnrollmentDto[]> {
  const items = await prisma.enrollment.findMany({
    where: { user_id: userId },
    include: { course: true },
    orderBy: { enrolled_at: "desc" },
  });

  return items.map((item) => ({
    id: item.id,
    courseId: item.course_id,
    userId: item.user_id,
    status: item.status,
    progressPercent: item.progress_percent,
    enrolledAt: item.enrolled_at.toISOString(),
    startedAt: item.started_at?.toISOString() ?? null,
    completedAt: item.completed_at?.toISOString() ?? null,
    lastAccessedAt: item.last_accessed_at?.toISOString() ?? null,
    courseTitle: item.course.title,
  }));
}

export async function getProgressSummary(userId: string): Promise<ProgressSummaryDto> {
  const [enrollments, completedLessons, attempts] = await Promise.all([
    prisma.enrollment.findMany({ where: { user_id: userId } }),
    prisma.lesson_progress.count({
      where: {
        user_id: userId,
        status: "completed",
      },
    }),
    prisma.assessment_attempt.findMany({
      where: {
        user_id: userId,
        score: { not: null },
        max_score: { not: null },
      },
    }),
  ]);

  const quizAverage =
    attempts.length === 0
      ? 0
      : Math.round(
          attempts.reduce(
            (sum, item) =>
              sum + Math.round(((item.score ?? 0) / Math.max(item.max_score ?? 1, 1)) * 100),
            0,
          ) / attempts.length,
        );

  return {
    completedCourses: enrollments.filter((item) => item.status === "completed").length,
    hoursLearned: completedLessons,
    quizAverage,
    streakDays: Math.max(1, enrollments.filter((item) => item.last_accessed_at).length),
  };
}

export async function getDashboardData(viewer: { id: string }): Promise<DashboardResponseDto> {
  const [courses, progressSummary] = await Promise.all([
    listCourses(viewer),
    getProgressSummary(viewer.id),
  ]);
  const enrolledCourses = courses.filter((course) => course.enrolled);
  const upcomingItems =
    enrolledCourses.length > 0
      ? await getUpcomingDashboardItems(
          viewer.id,
          enrolledCourses.map((course) => course.id),
        )
      : [];
  const activeCourses = enrolledCourses.filter((course) => course.progress < 100);
  const weeklyGoalPercent =
    activeCourses.length === 0
      ? progressSummary.completedCourses > 0
        ? 100
        : 0
      : Math.round(
          activeCourses.reduce((sum, course) => sum + course.progress, 0) / activeCourses.length,
        );

  return {
    courses,
    progressSummary,
    featuredCourse:
      enrolledCourses.find((course) => course.featured) ??
      courses.find((course) => course.featured) ??
      null,
    enrolledCourses,
    focusMetrics: {
      weeklyGoalPercent,
      assignmentsPercent: progressSummary.quizAverage,
    },
    upcomingItems,
  };
}

async function getUpcomingDashboardItems(userId: string, courseIds: string[]) {
  const sections = await prisma.section.findMany({
    where: {
      course_id: { in: courseIds },
    },
    include: {
      course: true,
      lessons: {
        where: { status: "published" },
        include: {
          progress_records: {
            where: { user_id: userId },
          },
        },
        orderBy: { position: "asc" },
      },
    },
    orderBy: [{ course_id: "asc" }, { position: "asc" }],
  });

  return sections
    .flatMap((section) =>
      section.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        subtitle: `${section.course.title} - ${lesson.estimated_minutes ?? 5} min`,
        href: `/course/${section.course_id}?lesson=${lesson.id}`,
        progressStatus: lesson.progress_records[0]?.status ?? "not_started",
        sectionPosition: section.position,
        lessonPosition: lesson.position,
      })),
    )
    .filter((lesson) => lesson.progressStatus !== "completed")
    .sort((a, b) => a.sectionPosition - b.sectionPosition || a.lessonPosition - b.lessonPosition)
    .slice(0, 3)
    .map(({ id, title, subtitle, href }) => ({ id, title, subtitle, href }));
}
