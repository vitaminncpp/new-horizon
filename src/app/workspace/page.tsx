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
      <main className="min-h-screen bg-(--bg) px-6 py-8 text-(--text-primary)">
        Loading workspace…
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-(--bg) text-(--text-primary)">
      <div className="absolute inset-0 bg-(image:--gradient-page)" />
      <div className="absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,oklch(0.35_0.14_280/0.25),oklch(0.25_0.10_275/0.15)_40%,transparent_70%)]" />

      <div className="relative flex min-h-screen flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="rounded-xl border border-(--border-accent) bg-(--surface-glass) p-6 shadow-(--shadow-lg) backdrop-blur-xl lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-(--primary)">
                Continue learning
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight lg:text-3xl">
                {user?.name
                  ? `${user.name}, your next lesson is ready.`
                  : "Your workspace is ready."}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-(--text-secondary)">
                Track recent progress, jump back into active paths, and review quizzes and coding
                lab outcomes without hunting through the catalog.
              </p>
            </div>

            {continueLearning ? (
              <Link
                href={`/learn/${continueLearning.lesson.section.course.id}/lessons/${continueLearning.lesson.id}`}
                className="rounded-lg bg-(--primary) px-5 py-2.5 text-sm font-semibold text-(--primary-contrast) shadow-(--shadow-glow) transition hover:brightness-110"
              >
                Resume {continueLearning.lesson.title}
              </Link>
            ) : (
              <Link
                href="/"
                className="rounded-lg bg-(--primary) px-5 py-2.5 text-sm font-semibold text-(--primary-contrast) shadow-(--shadow-glow) transition hover:brightness-110"
              >
                Explore catalog
              </Link>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <div className="rounded-xl border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-(--secondary)">
                    Active paths
                  </p>
                  <h2 className="mt-1 text-lg font-semibold lg:text-xl">Enrolled courses</h2>
                </div>
                <Link
                  href="/"
                  className="rounded-lg border border-(--border) bg-(--surface-raised) px-3 py-1.5 text-sm font-medium transition-all hover:border-(--border-strong) hover:bg-(--surface-soft)"
                >
                  Browse more
                </Link>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {dashboard.enrollments.map((enrollment) => (
                  <article
                    key={enrollment.id}
                    className="group relative rounded-lg border border-(--border) bg-(--surface) p-4 transition-all hover:border-(--primary-border) hover:shadow-(--shadow-sm)"
                  >
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-(--primary-soft)/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold">{enrollment.course.title}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.1em] text-(--text-tertiary)">
                          {enrollment.course.level} • {enrollment.status}
                        </p>
                      </div>
                      <span className="rounded-md border border-(--primary-border) bg-(--primary-soft) px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-(--primary)">
                        {enrollment.progress_percent}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-(--surface-inset) overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r from-(--primary) to-(--secondary) ${progressWidthClass(enrollment.progress_percent)} transition-all`}
                      />
                    </div>
                    <Link
                      href={`/courses/${enrollment.course.id}`}
                      className="mt-3 inline-flex rounded-lg border border-(--border) bg-(--surface-inset) px-3 py-1.5 text-xs font-medium transition-all hover:border-(--primary-border) hover:bg-(--primary-soft) hover:text-(--primary)"
                    >
                      Open course
                    </Link>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl lg:p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-(--accent)">Lesson stream</p>
              <h2 className="mt-1 text-lg font-semibold lg:text-xl">Recent activity</h2>
              <div className="mt-4 space-y-2">
                {dashboard.recentProgress.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/learn/${entry.lesson.section.course.id}/lessons/${entry.lesson.id}`}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-(--border) bg-(--surface) px-4 py-3 transition-all hover:border-(--border-strong) hover:bg-(--surface-raised)"
                  >
                    <div>
                      <p className="text-sm font-semibold group-hover:text-(--primary) transition-colors">
                        {entry.lesson.title}
                      </p>
                      <p className="mt-0.5 text-xs uppercase tracking-[0.1em] text-(--text-tertiary)">
                        {entry.lesson.section.course.title} • {entry.lesson.type}
                      </p>
                    </div>
                    <span className="rounded-md border border-(--accent-border, oklch(0.5 0.1 75)) bg-(--warning-bg) px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-(--warning)">
                      {entry.progress_percent}%
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl lg:p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-(--info)">Quiz outcomes</p>
              <div className="mt-4 space-y-2">
                {dashboard.attempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="rounded-lg border border-(--border) bg-(--surface) px-4 py-3 transition-all hover:border-(--border-strong)"
                  >
                    <p className="text-sm font-semibold">{attempt.assessment.title}</p>
                    <p className="mt-1 text-xs text-(--text-secondary)">
                      {attempt.assessment.course.title}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.1em] text-(--text-tertiary)">
                        {attempt.status}
                      </span>
                      <span className="text-(--text-tertiary)">•</span>
                      <span className="text-sm font-semibold text-(--primary)">
                        {attempt.score ?? 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl lg:p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-(--success)">Coding labs</p>
              <div className="mt-4 space-y-2">
                {dashboard.submissions.map((submission) => (
                  <div
                    key={submission.id}
                    className="rounded-lg border border-(--border) bg-(--surface) px-4 py-3 transition-all hover:border-(--border-strong)"
                  >
                    <p className="text-sm font-semibold">{submission.coding_exercise.title}</p>
                    <p className="mt-1 text-xs text-(--text-secondary)">
                      {submission.coding_exercise.language}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.1em] text-(--text-tertiary)">
                        {submission.status}
                      </span>
                      <span className="text-(--text-tertiary)">•</span>
                      <span className="text-sm font-semibold text-(--success)">
                        {submission.score ?? 0} pts
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
