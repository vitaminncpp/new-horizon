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
    <main className="relative min-h-screen overflow-hidden bg-bg text-text-primary">
      <div className="absolute inset-0 gradient-page" />

      <div className="relative flex min-h-screen flex-col px-6 py-8 lg:px-12 lg:py-12">
        <header className="rounded-xl border border-border-accent bg-surface-glass px-8 py-10 shadow-lg backdrop-blur-xl lg:px-12 lg:py-16">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
                New Horizon Learning
              </p>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Master modern engineering through practice.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-text-secondary sm:text-xl">
                Browse guided paths, enroll in interactive labs, and build production-ready skills
                without switching contexts.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
              {user ? (
                <Link
                  href="/workspace"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-bold text-primary-contrast shadow-glow transition hover:brightness-110 active:scale-95"
                >
                  Go to Workspace
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-bold text-primary-contrast shadow-glow transition hover:brightness-110 active:scale-95"
                >
                  Start Learning Free
                </Link>
              )}
              {user?.role === "instructor" || user?.role === "admin" ? (
                <Link
                  href="/instructor"
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-raised px-8 py-4 text-base font-bold text-text-primary transition hover:border-border-strong hover:bg-surface-soft active:scale-95"
                >
                  Instructor Studio
                </Link>
              ) : null}
            </div>
          </div>
        </header>

        <section className="mt-12 flex flex-wrap items-center gap-3">
          <span className="mr-2 text-xs font-bold uppercase tracking-widest text-text-tertiary">
            Filter by level:
          </span>
          {(["all", "beginner", "intermediate", "advanced"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`rounded-lg px-5 py-2.5 text-sm font-bold transition-all ${
                activeLevel === level
                  ? "bg-primary text-primary-contrast shadow-glow"
                  : "border border-border bg-surface-glass text-text-secondary hover:border-border-strong hover:text-text-primary"
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </section>

        <section className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCourses.map((course) => (
            <article
              key={course.id}
              className="group flex flex-col rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary-border hover:shadow-lg"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded bg-primary-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary-border">
                    {course.level}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {course.estimated_minutes ?? 0}m
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                  {course.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary line-clamp-3">
                  {course.summary || course.description || "No description provided."}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <StatPill label="Sections" value={course._count.sections} />
                <StatPill label="Labs" value={course._count.assessments} />
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                    Instructor
                  </span>
                  <span className="text-sm font-bold text-text-primary">{course.creator.name}</span>
                </div>
                <Link
                  href={`/courses/${course.id}`}
                  className="rounded-lg border border-border bg-surface-raised px-4 py-2 text-xs font-bold text-text-primary transition-all hover:border-primary-border hover:bg-primary-soft hover:text-primary active:scale-95"
                >
                  View Path
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
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">{label}</p>
      <p className="mt-1 text-sm font-extrabold">{value}</p>
    </div>
  );
}
