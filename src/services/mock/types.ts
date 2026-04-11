export type ThemeMode = "light" | "dark";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "learner" | "instructor" | "admin";
  major: string;
  plan: string;
  avatar: string;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  durationHours: number;
  rating: number;
  reviews: number;
  tag: string;
  badge: string;
  summary: string;
  description: string;
  instructor: string;
  instructorTitle: string;
  thumbnail: string;
  heroImage: string;
  accent: string;
  progress: number;
  modules: number;
  lessons: number;
  hoursLabel: string;
  language: string;
  enrolled: boolean;
  featured: boolean;
};

export type LessonItem = {
  id: string;
  title: string;
  duration: string;
  status: "complete" | "current" | "locked";
  type: "video" | "quiz";
};

export type LessonModule = {
  id: string;
  title: string;
  completed: number;
  total: number;
  items: LessonItem[];
};

export type CourseLessons = {
  courseId: string;
  modules: LessonModule[];
};
