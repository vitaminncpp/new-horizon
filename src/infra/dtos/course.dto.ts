import type { Course, CourseLessons } from "@/src/services/mock/types";

export interface ProgressSummaryDto {
  completedCourses: number;
  hoursLearned: number;
  quizAverage: number;
  streakDays: number;
}

export interface DashboardResponseDto {
  progressSummary: ProgressSummaryDto;
  featuredCourse: Course | null;
  enrolledCourses: Course[];
}

export interface CoursesResponseDto {
  items: Course[];
}

export interface CourseResponseDto {
  item: Course;
}

export interface CourseLessonsResponseDto {
  item: CourseLessons;
}
