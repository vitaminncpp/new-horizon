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

  const progressWidthClass = (percent: number) => {
    if (percent >= 100) return "w-full";
    if (percent >= 90) return "w-11/12";
    if (percent >= 80) return "w-10/12";
    if (percent >= 70) return "w-9/12";
    if (percent >= 60) return "w-8/12";
    if (percent >= 50) return "w-6/12";
    if (percent >= 40) return "w-5/12";
    if (percent >= 30) return "w-4/12";
    if (percent >= 20) return "w-3/12";
    if (percent >= 10) return "w-2/12";
    if (percent > 0) return "w-1/12";
    return "w-0";
  };

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
    <main className="relative min-h-screen overflow-hidden bg-bg text-text-primary">
      <div className="absolute inset-0 gradient-page opacity-50" />

      <div className="relative flex min-h-screen flex-col px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        {course ? (
          <div className="mx-auto w-full space-y-8">
            <header className="rounded-xl border border-border-accent bg-surface-glass p-8 shadow-lg backdrop-blur-xl lg:p-12">
              <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
                <div className="">
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
                    {course.level} path
                  </p>
                  <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                    {course.title}
                  </h1>
                  <p className="mt-6 text-lg leading-relaxed text-text-secondary">
                    {course.description || course.summary || "Course description coming soon."}
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest text-text-tertiary">
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {course.creator.name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
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
                </div>

                <div className="flex w-full max-w-sm flex-col gap-5 rounded-xl border border-border bg-surface-raised p-6 shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                      Your Progress
                    </span>
                    <span className="text-lg font-black text-primary">
                      {enrollment?.progress_percent ?? 0}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-inset overflow-hidden border border-border">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r from-primary to-secondary ${progressWidthClass(enrollment?.progress_percent ?? 0)} transition-all duration-1000`}
                    />
                  </div>
                  {enrollment ? (
                    firstOpenLesson ? (
                      <Link
                        href={`/learn/${course.id}/lessons/${firstOpenLesson.id}`}
                        className="rounded-lg bg-primary px-6 py-3.5 text-center text-sm font-bold text-primary-contrast shadow-glow transition hover:brightness-110 active:scale-95"
                      >
                        {enrollment.progress_percent > 0 ? "Continue Learning" : "Start Path"}
                      </Link>
                    ) : (
                      <div className="rounded-lg bg-surface-inset px-4 py-3 text-center text-sm font-bold text-text-tertiary border border-border">
                        Path curriculum coming soon
                      </div>
                    )
                  ) : (
                    <button
                      onClick={() => void handleEnroll()}
                      disabled={isSubmitting}
                      className="rounded-lg bg-primary px-6 py-3.5 text-center text-sm font-bold text-primary-contrast shadow-glow transition hover:brightness-110 active:scale-95 disabled:opacity-60"
                    >
                      {isSubmitting ? "Enrolling..." : "Enroll Now"}
                    </button>
                  )}
                </div>
              </div>
            </header>

            {message ? (
              <div className="rounded-lg border border-success/30 bg-success-bg px-6 py-4 text-sm font-bold text-success shadow-sm">
                {message}
              </div>
            ) : null}

            <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
              <section className="rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl lg:p-8">
                <div className="flex items-center gap-3 border-b border-border pb-6 mb-8">
                  <div className="h-2 w-2 rounded-full bg-secondary" />
                  <h2 className="text-xl font-bold uppercase tracking-widest text-text-primary">
                    Curriculum
                  </h2>
                </div>
                <div className="space-y-6">
                  {course.sections.map((section) => (
                    <article
                      key={section.id}
                      className="rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-border-strong"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div>
                          <p className="text-sm font-black text-text-tertiary tracking-widest uppercase">
                            Section {section.position}
                          </p>
                          <h3 className="mt-1 text-xl font-bold">{section.title}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                            {section.description || "In-depth lessons exploring these concepts."}
                          </p>
                        </div>
                        <span className="rounded bg-secondary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-secondary border border-secondary/20">
                          {section.lessons.length} Units
                        </span>
                      </div>

                      <div className="mt-6 space-y-3">
                        {section.lessons.map((lesson) => {
                          const progress = lesson.progresses?.[0];
                          return (
                            <div
                              key={lesson.id}
                              className="group rounded-lg border border-border bg-surface-inset px-5 py-4 transition-all hover:border-primary-border hover:bg-surface shadow-sm"
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-text-tertiary">
                                      #{lesson.position}
                                    </span>
                                    <p className="text-sm font-bold group-hover:text-primary transition-colors">
                                      {lesson.title}
                                    </p>
                                  </div>
                                  <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                                    {lesson.type.replace("_", " ")} •{" "}
                                    {lesson.estimated_minutes ?? 0}m
                                    {lesson.is_preview ? " • preview" : ""}
                                  </p>
                                </div>
                                {enrollment ? (
                                  <Link
                                    href={`/learn/${course.id}/lessons/${lesson.id}`}
                                    className="rounded-lg border border-border bg-surface-raised px-4 py-2 text-xs font-bold transition-all hover:border-primary-border hover:bg-primary-soft hover:text-primary shadow-sm"
                                  >
                                    Open
                                  </Link>
                                ) : (
                                  <span className="rounded-lg border border-border bg-surface-muted/50 px-4 py-2 text-xs font-bold text-text-tertiary opacity-50 cursor-not-allowed">
                                    Locked
                                  </span>
                                )}
                              </div>
                              {enrollment && progress ? (
                                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`h-1.5 w-1.5 rounded-full ${
                                        progress.status === "completed"
                                          ? "bg-success"
                                          : progress.status === "in_progress"
                                            ? "bg-warning"
                                            : "bg-text-tertiary"
                                      }`}
                                    />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                                      {progress.status.replace("_", " ")}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-bold text-text-secondary">
                                    {progress.progress_percent}%
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <aside className="space-y-8">
                <div className="rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
                    Learning Experience
                  </p>
                  <ul className="mt-6 space-y-4">
                    <li className="flex gap-4 rounded-lg border border-border bg-surface p-4 transition-all hover:border-border-strong shadow-sm">
                      <div className="h-5 w-5 shrink-0 text-primary">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-xs font-bold leading-relaxed text-text-secondary uppercase tracking-wider">
                        Guided lessons with checkpoint progress
                      </p>
                    </li>
                    <li className="flex gap-4 rounded-lg border border-border bg-surface p-4 transition-all hover:border-border-strong shadow-sm">
                      <div className="h-5 w-5 shrink-0 text-info">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                      </div>
                      <p className="text-xs font-bold leading-relaxed text-text-secondary uppercase tracking-wider">
                        Interactive quizzes with instant feedback
                      </p>
                    </li>
                    <li className="flex gap-4 rounded-lg border border-border bg-surface p-4 transition-all hover:border-border-strong shadow-sm">
                      <div className="h-5 w-5 shrink-0 text-success">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                          />
                        </svg>
                      </div>
                      <p className="text-xs font-bold leading-relaxed text-text-secondary uppercase tracking-wider">
                        Coding labs for hands-on mastery
                      </p>
                    </li>
                  </ul>
                </div>

                <div className="rounded-xl border border-primary-border bg-primary-soft/30 p-6 shadow-md lg:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">
                      Continuous Growth
                    </p>
                  </div>
                  <p className="text-sm font-bold leading-relaxed text-text-secondary">
                    Your journey is saved at every step. Complete paths to build a portfolio of
                    verified skills across our engineering curriculum.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center p-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="ml-3 text-sm font-bold tracking-widest uppercase text-text-tertiary">
              Loading Path...
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
