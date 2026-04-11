import courses from "@/src/services/mock/courses.json";
import type { Course } from "@/src/services/mock/types";

function delay<T>(value: T, ms = 180) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

export async function listCourses() {
  return delay(courses as Course[]);
}

export async function getCourse(id: string) {
  const course = (courses as Course[]).find((item) => item.id === id || item.slug === id);
  if (!course) {
    throw new Error("Course not found.");
  }

  return delay(course);
}
