"use client";

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import * as courseService from "@/src/services/api/course.service";
import * as lessonService from "@/src/services/api/lesson.service";
import * as progressService from "@/src/services/api/progress.service";
import { useAuth } from "@/src/context/auth.context";
import type { Course, CourseLessons } from "@/src/services/mock/types";

type LearningContextValue = {
  courses: Course[];
  progressSummary: {
    completedCourses: number;
    hoursLearned: number;
    quizAverage: number;
    streakDays: number;
  } | null;
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
        const courseList = await courseService.listCourses();

        if (!active) {
          return;
        }

        setCourses(courseList);

        if (!user) {
          setProgressSummary({
            completedCourses: 0,
            hoursLearned: 0,
            quizAverage: 0,
            streakDays: 0,
          });
          return;
        }

        const summary = await progressService.getProgressSummary();

        if (!active) {
          return;
        }

        setProgressSummary(summary);
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
