import lessons from "@/src/services/mock/lessons.json";
import type { CourseLessons } from "@/src/services/mock/types";

function delay<T>(value: T, ms = 180) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

export async function getLessonsByCourse(courseId: string) {
  const courseLessons = (lessons as CourseLessons[]).find((item) => item.courseId === courseId);
  if (!courseLessons) {
    throw new Error("Lessons not found.");
  }

  return delay(courseLessons);
}
