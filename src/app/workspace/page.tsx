"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApi } from "@/src/infra/api/api.context";
import { useAuth } from "@/src/infra/auth/auth.context";

type DashboardData = {
  enrollments: Array<{
    id: string;
    status: "active" | "completed" | "paused" | "dropped";
    progress_percent: number;
    last_accessed_at: string | null;
    course: {
      id: string;
      title: string;
      slug: string;
      thumbnail_url: string | null;
      estimated_minutes: number | null;
      level: "beginner" | "intermediate" | "advanced";
    };
  }>;
  recentProgress: Array<{
    id: string;
    status: "not_started" | "in_progress" | "completed";
    progress_percent: number;
    lesson: {
      id: string;
      title: string;
      slug: string;
      type: "video" | "article" | "live_session" | "quiz" | "coding_lab";
      section: {
        title: string;
        course: {
          id: string;
          title: string;
          slug: string;
        };
      };
    };
  }>;
  attempts: Array<{
    id: string;
    status: string;
    score: number | null;
    assessment: {
      title: string;
      type: string;
      course: {
        title: string;
      };
    };
  }>;
  submissions: Array<{
    id: string;
    status: string;
    score: number | null;
    coding_exercise: {
      title: string;
      language: string;
    };
  }>;
};

function progressWidthClass(value: number) {
  if (value >= 100) return "w-full";
  if (value >= 90) return "w-11/12";
  if (value >= 80) return "w-10/12";
  if (value >= 70) return "w-9/12";
  if (value >= 60) return "w-8/12";
  if (value >= 50) return "w-6/12";
  if (value >= 40) return "w-5/12";
  if (value >= 30) return "w-4/12";
  if (value >= 20) return "w-3/12";
  if (value >= 10) return "w-2/12";
  if (value > 0) return "w-1/12";
  return "w-0";
}

export default function Workspace() {
  const api = useApi();
  const { user, isLoading } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!user) return;
    void api.get<DashboardData>("/api/dashboard").then(setDashboard);
  }, [api, user]);

  const continueLearning = useMemo(() => dashboard?.recentProgress[0], [dashboard]);

  if (isLoading || !dashboard) {
    return (
      <main className="min-h-screen bg-bg px-6 py-12 flex flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-text-secondary tracking-widest uppercase">
          Preparing your workspace...
        </p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg text-text-primary">
      <div className="absolute inset-0 gradient-page opacity-50" />

      <div className="relative flex min-h-screen flex-col gap-8 px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <header className="rounded-xl border border-border-accent bg-surface-glass p-8 shadow-lg backdrop-blur-xl lg:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Welcome Back
              </p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight lg:text-4xl">
                {user?.name ? `${user.name}, ready to dive in?` : "Your learning dashboard."}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-text-secondary">
                Pick up where you left off, track your overall progress across paths, and review
                your performance in recent labs and quizzes.
              </p>
            </div>

            {continueLearning ? (
              <Link
                href={`/learn/${continueLearning.lesson.section.course.id}/lessons/${continueLearning.lesson.id}`}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-bold text-primary-contrast shadow-glow transition hover:brightness-110 active:scale-95"
              >
                Resume {continueLearning.lesson.title}
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-base font-bold text-primary-contrast shadow-glow transition hover:brightness-110 active:scale-95"
              >
                Explore Catalog
              </Link>
            )}
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            {/* Active Paths */}
            <div className="rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                    Active Paths
                  </p>
                  <h2 className="mt-1 text-xl font-bold">Enrolled Courses</h2>
                </div>
                <Link
                  href="/"
                  className="rounded-lg border border-border bg-surface-raised px-4 py-2 text-xs font-bold transition hover:border-border-strong hover:bg-surface-soft active:scale-95"
                >
                  Browse More
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {dashboard.enrollments.map((enrollment) => (
                  <article
                    key={enrollment.id}
                    className="group relative rounded-lg border border-border bg-surface p-5 transition-all hover:border-primary-border hover:shadow-sm"
                  >
                    <div className="relative">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-bold group-hover:text-primary transition-colors">
                            {enrollment.course.title}
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                            {enrollment.course.level} • {enrollment.status}
                          </p>
                        </div>
                        <span className="rounded bg-primary-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary border border-primary-border">
                          {enrollment.progress_percent}%
                        </span>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-surface-inset overflow-hidden border border-border">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r from-primary to-secondary ${progressWidthClass(enrollment.progress_percent)} transition-all duration-1000`}
                        />
                      </div>
                      <Link
                        href={`/courses/${enrollment.course.id}`}
                        className="mt-4 inline-flex items-center rounded-lg border border-border bg-surface-inset px-4 py-2 text-xs font-bold transition-all hover:border-primary-border hover:bg-primary-soft hover:text-primary"
                      >
                        Open Course
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Activity Stream
              </p>
              <h2 className="mt-1 text-xl font-bold">Recent Lessons</h2>
              <div className="mt-6 space-y-3">
                {dashboard.recentProgress.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/learn/${entry.lesson.section.course.id}/lessons/${entry.lesson.id}`}
                    className="group flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-5 py-4 transition-all hover:border-border-strong hover:bg-surface-soft shadow-sm"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-bold group-hover:text-primary transition-colors">
                        {entry.lesson.title}
                      </p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                        {entry.lesson.section.course.title} • {entry.lesson.type.replace("_", " ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="rounded bg-warning-bg px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-warning border border-warning/20">
                        {entry.progress_percent}%
                      </span>
                      <svg
                        className="h-4 w-4 text-text-tertiary group-hover:text-primary transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            {/* Quiz Outcomes */}
            <div className="rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-info">Quiz Reports</p>
              <div className="mt-6 space-y-3">
                {dashboard.attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="rounded-lg border border-border bg-surface p-4 transition-all hover:border-border-strong shadow-sm"
                  >
                    <p className="text-sm font-bold leading-tight">{attempt.assessment.title}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                      {attempt.assessment.course.title}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                        {attempt.status}
                      </span>
                      <span className="text-sm font-extrabold text-primary">
                        {attempt.score ?? 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coding Labs */}
            <div className="rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-success">
                Lab Outcomes
              </p>
              <div className="mt-6 space-y-3">
                {dashboard.submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="rounded-lg border border-border bg-surface p-4 transition-all hover:border-border-strong shadow-sm"
                  >
                    <p className="text-sm font-bold leading-tight">
                      {submission.coding_exercise.title}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                      {submission.coding_exercise.language}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                        {submission.status}
                      </span>
                      <span className="text-sm font-extrabold text-success">
                        {submission.score ?? 0} PTS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
