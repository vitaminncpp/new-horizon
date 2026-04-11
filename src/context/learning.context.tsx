"use client";

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import * as courseService from "@/src/services/api/course.service";
import * as lessonService from "@/src/services/api/lesson.service";
import * as progressService from "@/src/services/api/progress.service";
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [progressSummary, setProgressSummary] =
    useState<LearningContextValue["progressSummary"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([courseService.listCourses(), progressService.getProgressSummary()])
      .then(([courseList, summary]) => {
        setCourses(courseList);
        setProgressSummary(summary);
      })
      .catch((cause) => {
        setError(cause instanceof Error ? cause.message : "Unable to load learning data.");
      })
      .finally(() => setIsLoading(false));
  }, []);

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
