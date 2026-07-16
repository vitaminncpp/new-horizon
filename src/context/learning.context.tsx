"use client";

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import * as courseService from "@/src/services/api/course.service";
import * as dashboardService from "@/src/services/api/dashboard.service";
import * as lessonService from "@/src/services/api/lesson.service";
import { useAuth } from "@/src/context/auth.context";
import type { DashboardResponseDto, ProgressSummaryDto } from "@/src/infra/dtos/course.dto";
import type { Course, CourseLessons } from "@/src/services/mock/types";

type LearningContextValue = {
  courses: Course[];
  progressSummary: ProgressSummaryDto | null;
  featuredCourse: Course | null;
  enrolledCourses: Course[];
  focusMetrics: DashboardResponseDto["focusMetrics"];
  upcomingItems: DashboardResponseDto["upcomingItems"];
  isLoading: boolean;
  error: string | null;
  getCourse: (courseId: string) => Promise<Course>;
  getLessons: (courseId: string) => Promise<CourseLessons>;
};

const LearningContext = createContext<LearningContextValue | null>(null);

export function LearningProvider({ children }: PropsWithChildren) {
  const { user, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressSummary, setProgressSummary] =
    useState<LearningContextValue["progressSummary"]>(null);
  const [featuredCourse, setFeaturedCourse] = useState<Course | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [focusMetrics, setFocusMetrics] = useState<DashboardResponseDto["focusMetrics"]>({
    weeklyGoalPercent: 0,
    assignmentsPercent: 0,
  });
  const [upcomingItems, setUpcomingItems] = useState<DashboardResponseDto["upcomingItems"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    const load = async () => {
      try {
        if (user) {
          const dashboard = await dashboardService.getDashboardData();

          if (!active) {
            return;
          }

          setCourses(dashboard.courses);
          setProgressSummary(dashboard.progressSummary);
          setFeaturedCourse(dashboard.featuredCourse);
          setEnrolledCourses(dashboard.enrolledCourses);
          setFocusMetrics(dashboard.focusMetrics);
          setUpcomingItems(dashboard.upcomingItems);
          return;
        }

        const courseList = await courseService.listCourses();

        if (!active) {
          return;
        }

        setCourses(courseList);
        setProgressSummary({
          completedCourses: 0,
          hoursLearned: 0,
          quizAverage: 0,
          streakDays: 0,
        });
        setFeaturedCourse(courseList.find((course) => course.featured) ?? courseList[0] ?? null);
        setEnrolledCourses([]);
        setFocusMetrics({ weeklyGoalPercent: 0, assignmentsPercent: 0 });
        setUpcomingItems([]);
      } catch (cause) {
        if (!active) {
          return;
        }

        setProgressSummary({
          completedCourses: 0,
          hoursLearned: 0,
          quizAverage: 0,
          streakDays: 0,
        });
        setFeaturedCourse(null);
        setEnrolledCourses([]);
        setFocusMetrics({ weeklyGoalPercent: 0, assignmentsPercent: 0 });
        setUpcomingItems([]);
        setError(cause instanceof Error ? cause.message : "Unable to load learning data.");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  return (
    <LearningContext.Provider
      value={{
        courses,
        progressSummary,
        featuredCourse,
        enrolledCourses,
        focusMetrics,
        upcomingItems,
        isLoading,
        error,
        getCourse: courseService.getCourse,
        getLessons: lessonService.getLessonsByCourse,
      }}
    >
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error("useLearning must be used within LearningProvider");
  }

  return context;
}
