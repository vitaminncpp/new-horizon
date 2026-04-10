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
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-10 lg:py-10">
        {course ? (
          <>
            <header className="rounded-[2rem] border border-(--border-accent) bg-(--surface-glass) p-6 shadow-(--shadow-lg) backdrop-blur-xl">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-xs uppercase tracking-[0.28em] text-(--text-secondary)">
                    {course.level} path
                  </p>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                    {course.title}
                  </h1>
                  <p className="mt-4 text-base leading-7 text-(--text-secondary)">
                    {course.description || course.summary || "Course description coming soon."}
                  </p>
                </div>

                <div className="flex w-full max-w-md flex-col gap-3 rounded-[1.75rem] border border-(--border) bg-(--surface) p-5">
                  <div className="flex items-center justify-between text-sm text-(--text-secondary)">
                    <span>Progress</span>
                    <span>{enrollment?.progress_percent ?? 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-(--surface-inset)">
                    <div className={`h-full rounded-full bg-(--primary) ${progressClass}`} />
                  </div>
                  {enrollment ? (
                    firstOpenLesson ? (
                      <Link
                        href={`/learn/${course.id}/lessons/${firstOpenLesson.id}`}
                        className="rounded-full bg-(--primary) px-5 py-3 text-center text-sm font-semibold text-(--primary-contrast)"
                      >
                        {enrollment.progress_percent > 0 ? "Continue learning" : "Start course"}
                      </Link>
                    ) : (
                      <div className="rounded-[1.5rem] bg-(--surface-inset) px-4 py-3 text-sm text-(--text-secondary)">
                        Lessons will appear here once the curriculum is published.
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => void handleEnroll()}
                      disabled={isSubmitting}
                      className="rounded-full bg-(--primary) px-5 py-3 text-sm font-semibold text-(--primary-contrast) disabled:opacity-60"
                    >
                      {isSubmitting ? "Enrolling…" : "Enroll now"}
                    </button>
                  )}
                  <p className="text-xs text-(--text-tertiary)">
                    Instructor: {course.creator.name} • {course.estimated_minutes ?? 0} minutes
                  </p>
                </div>
              </div>
            </header>

            {message ? (
              <div className="mt-4 rounded-3xl border border-(--border-accent) bg-(--surface) px-5 py-3 text-sm">
                {message}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                  Curriculum
                </p>
                <div className="mt-5 space-y-4">
                  {course.sections.map((section) => (
                    <article key={section.id} className="rounded-3xl border border-(--border) bg-(--surface) p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-lg font-semibold">
                            {section.position}. {section.title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-(--text-secondary)">
                            {section.description || "Structured lessons for this section."}
                          </p>
                        </div>
                        <span className="rounded-full bg-(--surface-accent) px-3 py-1 text-[10px] uppercase tracking-[0.18em]">
                          {section.lessons.length} lessons
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3">
                        {section.lessons.map((lesson) => {
                          const progress = lesson.progresses?.[0];
                          return (
                            <div
                              key={lesson.id}
                              className="rounded-2xl border border-(--border) bg-(--surface-inset) px-4 py-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold">
                                    {lesson.position}. {lesson.title}
                                  </p>
                                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-(--text-tertiary)">
                                    {lesson.type} • {lesson.estimated_minutes ?? 0} min
                                    {lesson.is_preview ? " • preview" : ""}
                                  </p>
                                </div>
                                {enrollment ? (
                                  <Link
                                    href={`/learn/${course.id}/lessons/${lesson.id}`}
                                    className="rounded-full bg-(--surface) px-3 py-2 text-xs font-medium"
                                  >
                                    Open
                                  </Link>
                                ) : (
                                  <span className="rounded-full border border-(--border) px-3 py-2 text-xs text-(--text-secondary)">
                                    Enroll
                                  </span>
                                )}
                              </div>
                              <div className="mt-3 flex items-center justify-between text-xs text-(--text-secondary)">
                                <span>
                                  {progress?.status === "completed"
                                    ? "Completed"
                                    : progress?.status === "in_progress"
                                      ? "In progress"
                                      : "Not started"}
                                </span>
                                <span>{progress?.progress_percent ?? 0}%</span>
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
                <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                    What you’ll practice
                  </p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-(--text-secondary)">
                    <li className="rounded-2xl bg-(--surface) px-4 py-3">Article-based learning with checkpoint progress</li>
                    <li className="rounded-2xl bg-(--surface) px-4 py-3">Quiz lessons with graded assessment attempts</li>
                    <li className="rounded-2xl bg-(--surface) px-4 py-3">Coding labs with tracked submissions</li>
                  </ul>
                </div>

                <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                    Continue path
                  </p>
                  <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
                    Learner completion is tracked across lessons and reflected in your dashboard. Certificate
                    logic can be layered on top later without changing this flow.
                  </p>
                </div>
              </aside>
            </div>
          </>
        ) : (
          <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-8 text-sm text-(--text-secondary)">
            Loading course…
          </div>
        )}
      </div>
    </main>
  );
}
