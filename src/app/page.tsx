"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApi } from "@/src/infra/api/api.context";
import { useAuth } from "@/src/infra/auth/auth.context";

type CourseCard = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  thumbnail_url: string | null;
  estimated_minutes: number | null;
  level: "beginner" | "intermediate" | "advanced";
  status: "draft" | "published" | "archived";
  creator: {
    id: string;
    name: string;
    role: string;
  };
  _count: {
    sections: number;
    enrollments: number;
    assessments: number;
  };
  enrollments?: Array<{
    status: string;
    progress_percent: number;
  }>;
};

const levelCopy: Record<CourseCard["level"], string> = {
  beginner: "Build the foundation",
  intermediate: "Sharpen practical fluency",
  advanced: "Tackle production complexity",
};

export default function HomePage() {
  const api = useApi();
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseCard[]>([]);
  const [activeLevel, setActiveLevel] = useState<"all" | CourseCard["level"]>("all");

  useEffect(() => {
    void api.get<CourseCard[]>("/api/courses").then(setCourses);
  }, [api]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => activeLevel === "all" || course.level === activeLevel);
  }, [courses, activeLevel]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-(--bg) text-(--text-primary)">
      <div className="absolute inset-0 bg-(image:--gradient-page)" />
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,oklch(0.76_0.12_210/0.22),transparent_72%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10 lg:py-10">
        <header className="rounded-[2rem] border border-(--border-accent) bg-(--surface-glass) px-6 py-6 shadow-(--shadow-lg) backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-(--text-secondary)">
                New Horizon Learning
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                Learn through guided lessons, quizzes, and coding labs.
              </h1>
              <p className="mt-4 text-base leading-7 text-(--text-secondary) sm:text-lg">
                Browse the catalog, enroll in a path, and move from reading to practice without
                switching contexts.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {user ? (
                <Link
                  href="/workspace"
                  className="rounded-full bg-(--primary) px-5 py-3 text-sm font-semibold text-(--primary-contrast)"
                >
                  Continue learning
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="rounded-full bg-(--primary) px-5 py-3 text-sm font-semibold text-(--primary-contrast)"
                >
                  Create learner account
                </Link>
              )}
              {user?.role === "instructor" || user?.role === "admin" ? (
                <Link
                  href="/instructor"
                  className="rounded-full border border-(--border) bg-(--surface) px-5 py-3 text-sm font-medium text-(--text-primary)"
                >
                  Instructor studio
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        <section className="mt-6 flex flex-wrap gap-3">
          {(["all", "beginner", "intermediate", "advanced"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeLevel === level
                  ? "bg-(--primary) text-(--primary-contrast)"
                  : "border border-(--border) bg-(--surface-glass) text-(--text-primary)"
              }`}
            >
              {level === "all" ? "All paths" : level}
            </button>
          ))}
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <article
              key={course.id}
              className="group rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-(--border-accent)"
            >
              <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,oklch(0.72_0.13_210/0.24),oklch(0.84_0.08_85/0.18))] p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-(--surface-raised) px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-(--text-primary)">
                    {course.level}
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-(--text-secondary)">
                    {course.estimated_minutes ?? 0} min
                  </span>
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight">{course.title}</h2>
                <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
                  {course.summary || course.description || "Course summary coming soon."}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <StatPill label="Sections" value={course._count.sections} />
                <StatPill label="Assessments" value={course._count.assessments} />
                <StatPill label="Learners" value={course._count.enrollments} />
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-(--text-tertiary)">
                    Instructor
                  </p>
                  <p className="mt-1 text-sm font-medium">{course.creator.name}</p>
                  <p className="mt-1 text-xs text-(--text-secondary)">{levelCopy[course.level]}</p>
                </div>
                <Link
                  href={`/courses/${course.id}`}
                  className="rounded-full bg-(--surface) px-4 py-2 text-sm font-medium text-(--text-primary)"
                >
                  View path
                </Link>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) px-3 py-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-(--text-tertiary)">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
