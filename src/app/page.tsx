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
      <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,oklch(0.40_0.16_280/0.30),oklch(0.30_0.12_275/0.15)_40%,transparent_70%)]" />

      <div className="relative flex min-h-screen flex-col px-6 py-8 lg:px-10 lg:py-10">
        <header className="rounded-xl border border-(--border-accent) bg-(--surface-glass) px-6 py-6 shadow-(--shadow-lg) backdrop-blur-xl lg:px-8 lg:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-(--primary)">
                New Horizon Learning
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
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
                  className="rounded-lg bg-(--primary) px-5 py-2.5 text-sm font-semibold text-(--primary-contrast) shadow-(--shadow-glow) transition hover:brightness-110"
                >
                  Continue learning
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="rounded-lg bg-(--primary) px-5 py-2.5 text-sm font-semibold text-(--primary-contrast) shadow-(--shadow-glow) transition hover:brightness-110"
                >
                  Create learner account
                </Link>
              )}
              {user?.role === "instructor" || user?.role === "admin" ? (
                <Link
                  href="/instructor"
                  className="rounded-lg border border-(--border) bg-(--surface-raised) px-4 py-2.5 text-sm font-medium text-(--text-primary) transition hover:border-(--border-strong) hover:bg-(--surface-soft)"
                >
                  Instructor studio
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        <section className="mt-6 flex flex-wrap gap-2">
          {(["all", "beginner", "intermediate", "advanced"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeLevel === level
                  ? "bg-(--primary) text-(--primary-contrast) shadow-(--shadow-glow)"
                  : "border border-(--border) bg-(--surface-glass) text-(--text-secondary) hover:border-(--border-strong) hover:text-(--text-primary)"
              }`}
            >
              {level === "all" ? "All paths" : level}
            </button>
          ))}
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCourses.map((course) => (
            <article
              key={course.id}
              className="group relative rounded-xl border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-(--primary-border) hover:shadow-(--shadow-lg)"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-(--primary-soft)/5 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

              <div className="relative rounded-lg bg-gradient-to-br from-(--bg-subtle) via-(--surface) to-(--surface-soft) border border-(--border) p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-md border border-(--primary-border) bg-(--primary-soft) px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-(--primary)">
                    {course.level}
                  </span>
                  <span className="text-xs uppercase tracking-[0.15em] text-(--text-tertiary)">
                    {course.estimated_minutes ?? 0} min
                  </span>
                </div>
                <h2 className="mt-4 text-xl font-semibold tracking-tight">{course.title}</h2>
                <p className="mt-2 text-sm leading-6 text-(--text-secondary)">
                  {course.summary || course.description || "Course summary coming soon."}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <StatPill label="Sections" value={course._count.sections} />
                <StatPill label="Assessments" value={course._count.assessments} />
                <StatPill label="Learners" value={course._count.enrollments} />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-(--text-tertiary)">
                    Instructor
                  </p>
                  <p className="mt-0.5 text-sm font-medium">{course.creator.name}</p>
                </div>
                <Link
                  href={`/courses/${course.id}`}
                  className="rounded-lg border border-(--border) bg-(--surface-raised) px-3 py-1.5 text-xs font-medium text-(--text-primary) transition-all hover:border-(--primary-border) hover:bg-(--primary-soft) hover:text-(--primary)"
                >
                  View
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
    <div className="rounded-lg border border-(--border) bg-(--surface) px-2 py-2 text-center">
      <p className="text-[10px] uppercase tracking-[0.15em] text-(--text-tertiary)">{label}</p>
      <p className="mt-1 text-base font-semibold">{value}</p>
    </div>
  );
}
