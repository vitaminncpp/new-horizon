import type { Course, CourseLessons } from "@/src/services/mock/types";

export interface ProgressSummaryDto {
  completedCourses: number;
  hoursLearned: number;
  quizAverage: number;
  streakDays: number;
}

export interface DashboardResponseDto {
  courses: Course[];
  progressSummary: ProgressSummaryDto;
  featuredCourse: Course | null;
  enrolledCourses: Course[];
  focusMetrics: {
    weeklyGoalPercent: number;
    assignmentsPercent: number;
  };
  upcomingItems: Array<{
    id: string;
    title: string;
    subtitle: string;
    href: string;
  }>;
}

export interface CoursesResponseDto {
  items: Course[];
  meta?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CourseResponseDto {
  item: Course;
}

export interface CourseLessonsResponseDto {
  item: CourseLessons;
}

export type CourseDto = Course;
export type CourseLessonsDto = CourseLessons;
