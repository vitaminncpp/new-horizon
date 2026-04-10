"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/src/infra/api/api.context";
import { useAuth } from "@/src/infra/auth/auth.context";

type LessonProgress = {
  status: "not_started" | "in_progress" | "completed";
  progress_percent: number;
};

type CourseDetail = {
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
    name: string;
    role: string;
  };
  sections: Array<{
    id: string;
    title: string;
    description: string | null;
    position: number;
    lessons: Array<{
      id: string;
      title: string;
      slug: string;
      description: string | null;
      type: "video" | "article" | "live_session" | "quiz" | "coding_lab";
      position: number;
      estimated_minutes: number | null;
      is_preview: boolean;
      progresses?: LessonProgress[];
    }>;
  }>;
  enrollments?: Array<{
    id: string;
    status: "active" | "completed" | "paused" | "dropped";
    progress_percent: number;
  }>;
};

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const api = useApi();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!params.courseId) return;
    void api.get<CourseDetail>(`/api/courses/${params.courseId}`).then(setCourse);
  }, [api, params.courseId]);

  const enrollment = course?.enrollments?.[0];
  const flatLessons = useMemo(
    () => course?.sections.flatMap((section) => section.lessons) ?? [],
    [course],
  );
  const firstOpenLesson = useMemo(
    () =>
      flatLessons.find((lesson) => {
        const progress = lesson.progresses?.[0];
        return !progress || progress.status !== "completed";
      }) ?? flatLessons[0],
    [flatLessons],
  );

  const progressClass =
    (enrollment?.progress_percent ?? 0) >= 100
      ? "w-full"
      : (enrollment?.progress_percent ?? 0) >= 90
        ? "w-11/12"
        : (enrollment?.progress_percent ?? 0) >= 80
          ? "w-10/12"
          : (enrollment?.progress_percent ?? 0) >= 70
            ? "w-9/12"
            : (enrollment?.progress_percent ?? 0) >= 60
              ? "w-8/12"
              : (enrollment?.progress_percent ?? 0) >= 50
                ? "w-6/12"
                : (enrollment?.progress_percent ?? 0) >= 40
                  ? "w-5/12"
                  : (enrollment?.progress_percent ?? 0) >= 30
                    ? "w-4/12"
                    : (enrollment?.progress_percent ?? 0) >= 20
                      ? "w-3/12"
                      : (enrollment?.progress_percent ?? 0) >= 10
                        ? "w-2/12"
                        : (enrollment?.progress_percent ?? 0) > 0
                          ? "w-1/12"
                          : "w-0";

  async function handleEnroll() {
    if (!course) return;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/courses/${course.id}`)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/api/courses/${course.id}/enroll`, {});
      setMessage("Enrollment successful. You can start learning now.");
      const refreshed = await api.get<CourseDetail>(`/api/courses/${course.id}`);
      setCourse(refreshed);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-(--bg) text-(--text-primary)">
      <div className="absolute inset-0 bg-(image:--gradient-page)" />
      <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,oklch(0.40_0.16_280/0.25),oklch(0.28_0.12_275/0.15)_40%,transparent_70%)]" />

      <div className="relative flex min-h-screen flex-col px-6 py-8 lg:px-10 lg:py-10">
        {course ? (
          <>
            <header className="rounded-xl border border-(--border-accent) bg-(--surface-glass) p-6 shadow-(--shadow-lg) backdrop-blur-xl lg:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--primary)">
                    {course.level} path
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                    {course.title}
                  </h1>
                  <p className="mt-4 text-base leading-7 text-(--text-secondary)">
                    {course.description || course.summary || "Course description coming soon."}
                  </p>
                </div>

                <div className="flex w-full max-w-md flex-col gap-3 rounded-lg border border-(--border) bg-(--surface-raised) p-5 shadow-(--shadow-sm)">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-(--text-secondary)">Progress</span>
                    <span className="font-semibold text-(--primary)">
                      {enrollment?.progress_percent ?? 0}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-(--surface-inset) overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r from-(--primary) to-(--secondary) ${progressClass} transition-all`}
                    />
                  </div>
                  {enrollment ? (
                    firstOpenLesson ? (
                      <Link
                        href={`/learn/${course.id}/lessons/${firstOpenLesson.id}`}
                        className="rounded-lg bg-(--primary) px-5 py-2.5 text-center text-sm font-semibold text-(--primary-contrast) shadow-(--shadow-glow) transition hover:brightness-110"
                      >
                        {enrollment.progress_percent > 0 ? "Continue learning" : "Start course"}
                      </Link>
                    ) : (
                      <div className="rounded-lg bg-(--surface-inset) px-4 py-2.5 text-sm text-(--text-secondary)">
                        Lessons will appear here once the curriculum is published.
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => void handleEnroll()}
                      disabled={isSubmitting}
                      className="rounded-lg bg-(--primary) px-5 py-2.5 text-sm font-semibold text-(--primary-contrast) shadow-(--shadow-glow) transition hover:brightness-110 disabled:opacity-60"
                    >
                      {isSubmitting ? "Enrolling…" : "Enroll now"}
                    </button>
                  )}
                  <div className="flex items-center gap-2 text-xs text-(--text-tertiary)">
                    <span>
                      Instructor:{" "}
                      <span className="text-(--text-secondary)">{course.creator.name}</span>
                    </span>
                    <span>•</span>
                    <span>{course.estimated_minutes ?? 0} minutes</span>
                  </div>
                </div>
              </div>
            </header>

            {message ? (
              <div className="mt-4 rounded-lg border border-(--success-border, oklch(0.5 0.1 165)) bg-(--success-bg) px-5 py-3 text-sm text-(--success)">
                {message}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="rounded-xl border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl lg:p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-(--secondary)">Curriculum</p>
                <div className="mt-4 space-y-3">
                  {course.sections.map((section) => (
                    <article
                      key={section.id}
                      className="rounded-lg border border-(--border) bg-(--surface) p-4 transition-all hover:border-(--border-strong)"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-semibold">
                            {section.position}. {section.title}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-(--text-secondary)">
                            {section.description || "Structured lessons for this section."}
                          </p>
                        </div>
                        <span className="rounded-md border border-(--secondary-border, oklch(0.5 0.1 185)) bg-(--info-bg) px-2 py-1 text-[10px] uppercase tracking-[0.1em] text-(--info)">
                          {section.lessons.length} lessons
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2">
                        {section.lessons.map((lesson) => {
                          const progress = lesson.progresses?.[0];
                          return (
                            <div
                              key={lesson.id}
                              className="group rounded-lg border border-(--border) bg-(--surface-inset) px-4 py-3 transition-all hover:border-(--primary-border) hover:bg-(--surface)"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold group-hover:text-(--primary) transition-colors">
                                    {lesson.position}. {lesson.title}
                                  </p>
                                  <p className="mt-0.5 text-xs uppercase tracking-[0.1em] text-(--text-tertiary)">
                                    {lesson.type} • {lesson.estimated_minutes ?? 0} min
                                    {lesson.is_preview ? " • preview" : ""}
                                  </p>
                                </div>
                                {enrollment ? (
                                  <Link
                                    href={`/learn/${course.id}/lessons/${lesson.id}`}
                                    className="rounded-lg border border-(--border) bg-(--surface-raised) px-3 py-1.5 text-xs font-medium transition-all hover:border-(--primary-border) hover:bg-(--primary-soft) hover:text-(--primary)"
                                  >
                                    Open
                                  </Link>
                                ) : (
                                  <span className="rounded-lg border border-(--border) px-3 py-1.5 text-xs text-(--text-secondary)">
                                    Enroll
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 flex items-center justify-between text-xs">
                                <span
                                  className={
                                    progress?.status === "completed"
                                      ? "text-(--success)"
                                      : progress?.status === "in_progress"
                                        ? "text-(--warning)"
                                        : "text-(--text-tertiary)"
                                  }
                                >
                                  {progress?.status === "completed"
                                    ? "Completed"
                                    : progress?.status === "in_progress"
                                      ? "In progress"
                                      : "Not started"}
                                </span>
                                <span className="font-medium text-(--text-secondary)">
                                  {progress?.progress_percent ?? 0}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <aside className="space-y-4">
                <div className="rounded-xl border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl lg:p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--accent)">
                    What you&apos;ll practice
                  </p>
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-(--text-secondary)">
                    <li className="rounded-lg border border-(--border) bg-(--surface) px-4 py-3 transition-all hover:border-(--border-strong) hover:bg-(--surface-raised)">
                      Article-based learning with checkpoint progress
                    </li>
                    <li className="rounded-lg border border-(--border) bg-(--surface) px-4 py-3 transition-all hover:border-(--border-strong) hover:bg-(--surface-raised)">
                      Quiz lessons with graded assessment attempts
                    </li>
                    <li className="rounded-lg border border-(--border) bg-(--surface) px-4 py-3 transition-all hover:border-(--border-strong) hover:bg-(--surface-raised)">
                      Coding labs with tracked submissions
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-(--primary-border) bg-(--primary-soft)/20 p-5 shadow-(--shadow-md) lg:p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--primary)">
                    Continue path
                  </p>
                  <p className="mt-2 text-sm leading-6 text-(--text-secondary)">
                    Learner completion is tracked across lessons and reflected in your dashboard.
                    Certificate logic can be layered on top later without changing this flow.
                  </p>
                </div>
              </aside>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-(--border) bg-(--surface-glass) p-8 text-sm text-(--text-secondary) backdrop-blur-xl">
            Loading course…
          </div>
        )}
      </div>
    </main>
  );
}
