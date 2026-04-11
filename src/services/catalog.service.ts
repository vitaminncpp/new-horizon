import courses from "@/src/services/mock/courses.json";
import lessons from "@/src/services/mock/lessons.json";
import type { Course, CourseLessons } from "@/src/services/mock/types";
import type { DashboardResponseDto, ProgressSummaryDto } from "@/src/infra/dtos/course.dto";
import { Exception } from "@/src/infra/exception/app.exception";
import ErrorCode from "@/src/infra/exception/error.enum";

const courseList = courses as Course[];
const lessonList = lessons as CourseLessons[];

const progressSummary: ProgressSummaryDto = {
  completedCourses: 12,
  hoursLearned: 148,
  quizAverage: 92,
  streakDays: 14,
};

export async function listCourses() {
  return courseList;
}

export async function getCourse(courseId: string) {
  const course = courseList.find((item) => item.id === courseId || item.slug === courseId);
  if (!course) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Course not found", { courseId });
  }

  return course;
}

export async function getCourseLessons(courseId: string) {
  const courseLessons = lessonList.find((item) => item.courseId === courseId);
  if (!courseLessons) {
    throw new Exception(ErrorCode.RESOURCE_NOT_FOUND, "Lessons not found", { courseId });
  }

  return courseLessons;
}

export async function getProgressSummary() {
  return progressSummary;
}

export async function getDashboardData(): Promise<DashboardResponseDto> {
  const featuredCourse = courseList.find((item) => item.featured) ?? null;

  return {
    progressSummary,
    featuredCourse,
    enrolledCourses: courseList.filter((item) => item.enrolled),
  };
}
