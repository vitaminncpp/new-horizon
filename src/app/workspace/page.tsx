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
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <section className="rounded-[2rem] border border-(--border-accent) bg-(--surface-glass) p-6 shadow-(--shadow-lg) backdrop-blur-xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-(--text-secondary)">
                Continue learning
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                {user?.name ? `${user.name}, your next lesson is ready.` : "Your workspace is ready."}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-(--text-secondary)">
                Track recent progress, jump back into active paths, and review quizzes and coding
                lab outcomes without hunting through the catalog.
              </p>
            </div>

            {continueLearning ? (
              <Link
                href={`/learn/${continueLearning.lesson.section.course.id}/lessons/${continueLearning.lesson.id}`}
                className="rounded-full bg-(--primary) px-5 py-3 text-sm font-semibold text-(--primary-contrast)"
              >
                Resume {continueLearning.lesson.title}
              </Link>
            ) : (
              <Link
                href="/"
                className="rounded-full bg-(--primary) px-5 py-3 text-sm font-semibold text-(--primary-contrast)"
              >
                Explore catalog
              </Link>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                    Active paths
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">Enrolled courses</h2>
                </div>
                <Link
                  href="/"
                  className="rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-medium"
                >
                  Browse more
                </Link>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {dashboard.enrollments.map((enrollment) => (
                  <article
                    key={enrollment.id}
                    className="rounded-3xl border border-(--border) bg-(--surface) p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-semibold">{enrollment.course.title}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-(--text-tertiary)">
                          {enrollment.course.level} • {enrollment.status}
                        </p>
                      </div>
                      <span className="rounded-full bg-(--surface-accent) px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                        {enrollment.progress_percent}%
                      </span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-(--surface-inset)">
                      <div className={`h-full rounded-full bg-(--primary) ${progressWidthClass(enrollment.progress_percent)}`} />
                    </div>
                    <Link
                      href={`/courses/${enrollment.course.id}`}
                      className="mt-4 inline-flex rounded-full bg-(--surface-inset) px-4 py-2 text-sm font-medium"
                    >
                      Open course
                    </Link>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                Lesson stream
              </p>
              <h2 className="mt-2 text-xl font-semibold">Recent activity</h2>
              <div className="mt-5 space-y-3">
                {dashboard.recentProgress.map((entry) => (
                  <Link
                    key={entry.id}
                    href={`/learn/${entry.lesson.section.course.id}/lessons/${entry.lesson.id}`}
                    className="flex items-center justify-between gap-3 rounded-3xl border border-(--border) bg-(--surface) px-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">{entry.lesson.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-(--text-tertiary)">
                        {entry.lesson.section.course.title} • {entry.lesson.type}
                      </p>
                    </div>
                    <span className="rounded-full bg-(--surface-accent) px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                      {entry.progress_percent}%
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                Quiz outcomes
              </p>
              <div className="mt-4 space-y-3">
                {dashboard.attempts.map((attempt) => (
                  <div key={attempt.id} className="rounded-3xl bg-(--surface) px-4 py-4">
                    <p className="text-sm font-semibold">{attempt.assessment.title}</p>
                    <p className="mt-1 text-xs text-(--text-secondary)">
                      {attempt.assessment.course.title}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-(--text-tertiary)">
                      {attempt.status} • {attempt.score ?? 0}%
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                Coding labs
              </p>
              <div className="mt-4 space-y-3">
                {dashboard.submissions.map((submission) => (
                  <div key={submission.id} className="rounded-3xl bg-(--surface) px-4 py-4">
                    <p className="text-sm font-semibold">{submission.coding_exercise.title}</p>
                    <p className="mt-1 text-xs text-(--text-secondary)">
                      {submission.coding_exercise.language}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.16em] text-(--text-tertiary)">
                      {submission.status} • {submission.score ?? 0} points
                    </p>
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
