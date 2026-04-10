"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/src/infra/api/api.context";
import { useAuth } from "@/src/infra/auth/auth.context";

type CourseDetail = {
  id: string;
  title: string;
  slug: string;
  sections: Array<{
    id: string;
    title: string;
    position: number;
    lessons: Array<{
      id: string;
      title: string;
      slug: string;
      type: "video" | "article" | "live_session" | "quiz" | "coding_lab";
      position: number;
      estimated_minutes: number | null;
      progresses?: Array<{
        status: "not_started" | "in_progress" | "completed";
        progress_percent: number;
      }>;
    }>;
  }>;
  enrollments?: Array<{
    progress_percent: number;
    status: string;
  }>;
};

type LessonDetail = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  type: "video" | "article" | "live_session" | "quiz" | "coding_lab";
  estimated_minutes: number | null;
  content_blocks: Array<{
    id: string;
    type: "markdown" | "code" | "embed" | "resource";
    title: string | null;
    content: Record<string, unknown>;
    position: number;
  }>;
  assessments: Array<{
    id: string;
    title: string;
    type: "practice" | "graded" | "final_exam";
    passing_score: number | null;
    max_attempts: number | null;
    time_limit_mins: number | null;
    is_published: boolean;
  }>;
  coding_exercises: Array<{
    id: string;
    title: string;
    prompt: string;
    starter_code: string | null;
    solution_code: string | null;
    language: string;
    max_score: number;
  }>;
  progresses?: Array<{
    status: "not_started" | "in_progress" | "completed";
    progress_percent: number;
    completed_at: string | null;
  }>;
};

type AssessmentDetail = {
  id: string;
  title: string;
  description: string | null;
  passing_score: number | null;
  questions: Array<{
    id: string;
    prompt: string;
    type: "single_choice" | "multiple_choice" | "short_text" | "code";
    options: Array<{
      id: string;
      label: string | null;
      content: string;
    }>;
  }>;
};

type CodingExerciseDetail = {
  id: string;
  title: string;
  prompt: string;
  starter_code: string | null;
  language: string;
  max_score: number;
  submissions?: Array<{
    id: string;
    submission_number: number;
    status: string;
    score: number | null;
    submitted_at: string | null;
  }>;
};

function progressTone(value: number) {
  if (value >= 100) return "bg-success";
  if (value >= 67) return "bg-info";
  if (value >= 34) return "bg-warning";
  return "bg-surface-inset";
}

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

export default function LessonPlayerPage() {
  const params = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const api = useApi();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [exercise, setExercise] = useState<CodingExerciseDetail | null>(null);
  const [message, setMessage] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | string[]>>({});
  const [codeAnswer, setCodeAnswer] = useState("");

  useEffect(() => {
    if (!params.courseId || !params.lessonId) return;

    void Promise.all([
      api.get<CourseDetail>(`/api/courses/${params.courseId}`),
      api.get<LessonDetail>(`/api/lessons/${params.lessonId}`),
    ]).then(async ([courseDetail, lessonDetail]) => {
      setCourse(courseDetail);
      setLesson(lessonDetail);

      if (lessonDetail.assessments[0]) {
        const detail = await api.get<AssessmentDetail>(
          `/api/assessments/${lessonDetail.assessments[0].id}`,
        );
        setAssessment(detail);
      } else {
        setAssessment(null);
      }

      if (lessonDetail.coding_exercises[0]) {
        const detail = await api.get<CodingExerciseDetail>(
          `/api/coding-exercises/${lessonDetail.coding_exercises[0].id}`,
        );
        setExercise(detail);
        setCodeAnswer(detail.starter_code ?? "");
      } else {
        setExercise(null);
      }
    });
  }, [api, params.courseId, params.lessonId]);

  const lessonList = useMemo(
    () => course?.sections.flatMap((section) => section.lessons) ?? [],
    [course],
  );
  const currentIndex = lessonList.findIndex((item) => item.id === params.lessonId);
  const nextLesson = currentIndex >= 0 ? lessonList[currentIndex + 1] : null;
  const currentProgress = lesson?.progresses?.[0];

  async function markProgress(status: "in_progress" | "completed") {
    if (!lesson) return;
    await api.post(`/api/lessons/${lesson.id}/progress`, {
      status,
      progress_percent: status === "completed" ? 100 : 50,
    });
    setMessage(status === "completed" ? "Lesson completed." : "Progress saved.");

    const [courseDetail, lessonDetail] = await Promise.all([
      api.get<CourseDetail>(`/api/courses/${params.courseId}`),
      api.get<LessonDetail>(`/api/lessons/${lesson.id}`),
    ]);
    setCourse(courseDetail);
    setLesson(lessonDetail);
  }

  async function submitQuiz() {
    if (!assessment || !lesson) return;

    const answers = assessment.questions.map((question) => {
      const answer = quizAnswers[question.id];
      return {
        question_id: question.id,
        ...(Array.isArray(answer)
          ? { selected_option_ids: answer }
          : question.type === "short_text"
            ? { text_answer: String(answer ?? "") }
            : question.type === "code"
              ? { code_answer: String(answer ?? "") }
              : { selected_option_ids: answer ? [String(answer)] : [] }),
      };
    });

    await api.post(`/api/assessments/${assessment.id}/attempts`, { answers });
    await markProgress("completed");
    setMessage("Quiz submitted and lesson marked complete.");
  }

  async function submitCodingExercise() {
    if (!exercise || !lesson) return;
    await api.post(`/api/coding-exercises/${exercise.id}/submissions`, {
      code: codeAnswer,
      language: exercise.language,
      status: "submitted",
      score: 0,
      test_results: [{ name: "Needs runtime execution", passed: false }],
    });
    await markProgress("completed");
    const detail = await api.get<CodingExerciseDetail>(`/api/coding-exercises/${exercise.id}`);
    setExercise(detail);
    setMessage("Submission stored and lesson marked complete.");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg text-text-primary">
      <div className="absolute inset-0 gradient-page" />
      <div className="relative mx-auto flex min-h-screen flex-col px-4 py-5 sm:px-6 lg:px-8">
        {course && lesson ? (
          <div className="grid flex-1 gap-6 xl:grid-cols-[300px_minmax(0,1fr)_280px]">
            <aside className="rounded-xl border border-border bg-surface-glass p-5 shadow-md backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-tertiary">
                Course Progress
              </p>
              <h2 className="mt-2 text-lg font-bold">{course.title}</h2>
              <div className="mt-6 space-y-6">
                {course.sections.map((section) => (
                  <div key={section.id}>
                    <p className="text-sm font-bold text-text-secondary">
                      {section.position}. {section.title}
                    </p>
                    <div className="mt-3 space-y-2">
                      {section.lessons.map((item) => {
                        const progress = item.progresses?.[0];
                        return (
                          <Link
                            key={item.id}
                            href={`/learn/${course.id}/lessons/${item.id}`}
                            className={`block rounded-lg border p-3 transition-all ${
                              item.id === lesson.id
                                ? "border-border-accent bg-surface-raised shadow-sm"
                                : "border-border bg-surface hover:border-border-strong"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-medium">{item.title}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
                                {item.type}
                              </span>
                            </div>
                            <div className="mt-3 h-1.5 rounded-full bg-surface-inset">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${progressTone(progress?.progress_percent ?? 0)} ${progressWidthClass(progress?.progress_percent ?? 0)}`}
                              />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <section className="space-y-6">
              <header className="rounded-xl border border-border-accent bg-surface-glass p-6 shadow-lg backdrop-blur-xl">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                      {lesson.type} lesson
                    </p>
                    <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                      {lesson.title}
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                      {lesson.description ||
                        "Follow the lesson materials and update progress as you go."}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-3">
                    <button
                      onClick={() => void markProgress("in_progress")}
                      className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold transition hover:border-border-strong hover:bg-surface-soft"
                    >
                      Save Progress
                    </button>
                    <button
                      onClick={() => void markProgress("completed")}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-contrast shadow-sm transition hover:brightness-110 active:scale-95"
                    >
                      Mark Complete
                    </button>
                  </div>
                </div>
              </header>

              {message ? (
                <div className="rounded-lg border border-success/30 bg-success-bg px-5 py-3 text-sm font-medium text-success">
                  {message}
                </div>
              ) : null}

              <div className="space-y-6">
                {lesson.type === "article" ||
                lesson.type === "video" ||
                lesson.type === "live_session"
                  ? lesson.content_blocks.map((block) => (
                      <LearnerBlock key={block.id} block={block} />
                    ))
                  : null}

                {lesson.type === "quiz" && assessment ? (
                  <div className="rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-warning" />
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary">
                        Quiz
                      </p>
                    </div>
                    <h2 className="mt-2 text-xl font-bold">{assessment.title}</h2>
                    <div className="mt-6 space-y-6">
                      {assessment.questions.map((question) => (
                        <div
                          key={question.id}
                          className="rounded-lg border border-border bg-surface p-5 shadow-sm"
                        >
                          <p className="text-base font-bold text-text-primary">{question.prompt}</p>
                          <div className="mt-4 space-y-3">
                            {(question.type === "single_choice" ||
                              question.type === "multiple_choice") &&
                              question.options.map((option) => {
                                const currentValue = quizAnswers[question.id];
                                const selected = Array.isArray(currentValue)
                                  ? currentValue.includes(option.id)
                                  : currentValue === option.id;
                                return (
                                  <label
                                    key={option.id}
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-all ${
                                      selected
                                        ? "border-primary bg-primary-soft text-primary"
                                        : "border-border bg-surface-inset hover:border-border-strong"
                                    }`}
                                  >
                                    <input
                                      type={
                                        question.type === "single_choice" ? "radio" : "checkbox"
                                      }
                                      checked={selected}
                                      onChange={(event) => {
                                        setQuizAnswers((current) => {
                                          if (question.type === "single_choice") {
                                            return { ...current, [question.id]: option.id };
                                          }

                                          const existing = Array.isArray(current[question.id])
                                            ? (current[question.id] as string[])
                                            : [];
                                          return {
                                            ...current,
                                            [question.id]: event.target.checked
                                              ? [...existing, option.id]
                                              : existing.filter((value) => value !== option.id),
                                          };
                                        });
                                      }}
                                      className="accent-primary"
                                    />
                                    <span className="font-medium">{option.content}</span>
                                  </label>
                                );
                              })}
                            {question.type === "short_text" ? (
                              <textarea
                                value={String(quizAnswers[question.id] ?? "")}
                                onChange={(event) =>
                                  setQuizAnswers((current) => ({
                                    ...current,
                                    [question.id]: event.target.value,
                                  }))
                                }
                                placeholder="Type your answer here..."
                                className="min-h-24 w-full rounded-lg border border-border bg-surface-inset px-4 py-3 text-sm transition focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                              />
                            ) : null}
                            {question.type === "code" ? (
                              <textarea
                                value={String(quizAnswers[question.id] ?? "")}
                                onChange={(event) =>
                                  setQuizAnswers((current) => ({
                                    ...current,
                                    [question.id]: event.target.value,
                                  }))
                                }
                                placeholder="Write your code here..."
                                className="min-h-48 w-full rounded-lg border border-border bg-surface-inset px-4 py-3 font-mono text-xs transition focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                              />
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => void submitQuiz()}
                      className="mt-6 w-full rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-contrast shadow-md transition hover:brightness-110 active:scale-95 sm:w-auto"
                    >
                      Submit Quiz
                    </button>
                  </div>
                ) : null}

                {lesson.type === "coding_lab" && exercise ? (
                  <div className="rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-success" />
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary">
                        Coding Lab
                      </p>
                    </div>
                    <h2 className="mt-2 text-xl font-bold">{exercise.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                      {exercise.prompt}
                    </p>
                    <textarea
                      value={codeAnswer}
                      onChange={(event) => setCodeAnswer(event.target.value)}
                      className="mt-6 min-h-[400px] w-full rounded-lg border border-border bg-surface px-4 py-4 font-mono text-xs shadow-inner focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <div className="mt-6 flex flex-wrap gap-4">
                      <button
                        onClick={() => void submitCodingExercise()}
                        className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-contrast shadow-md transition hover:brightness-110 active:scale-95"
                      >
                        Submit Solution
                      </button>
                      <button
                        onClick={() => setCodeAnswer(exercise.starter_code ?? "")}
                        className="rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold transition hover:border-border-strong hover:bg-surface-soft"
                      >
                        Reset Starter Code
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-xl border border-border bg-surface-glass p-5 shadow-md backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary">
                  Lesson Info
                </p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3 border border-border shadow-sm">
                    <span className="text-xs text-text-secondary">Progress</span>
                    <span className="text-sm font-bold text-primary">
                      {currentProgress?.progress_percent ?? 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3 border border-border shadow-sm">
                    <span className="text-xs text-text-secondary">Status</span>
                    <span className="text-sm font-bold capitalize">
                      {currentProgress?.status?.replace("_", " ") ?? "not started"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3 border border-border shadow-sm">
                    <span className="text-xs text-text-secondary">Duration</span>
                    <span className="text-sm font-bold">{lesson.estimated_minutes ?? 0} mins</span>
                  </div>
                </div>
              </div>

              {nextLesson ? (
                <div className="rounded-xl border border-border bg-surface-glass p-5 shadow-md backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">
                    Up Next
                  </p>
                  <p className="mt-3 text-lg font-bold leading-tight">{nextLesson.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                    Ready to move forward? Jump into the next lesson now.
                  </p>
                  <Link
                    href={`/learn/${course.id}/lessons/${nextLesson.id}`}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-contrast shadow-sm transition hover:brightness-110 active:scale-95"
                  >
                    Start Next Lesson
                  </Link>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-surface-glass p-5 shadow-md backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-info">
                    Path Complete
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                    You’ve reached the final lesson of this course. Your progress has been saved.
                  </p>
                </div>
              )}
            </aside>
          </div>
        ) : (
          <div className="flex items-center justify-center p-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="ml-3 text-sm font-medium text-text-secondary">Loading lesson...</span>
          </div>
        )}
      </div>
    </main>
  );
}

function LearnerBlock({ block }: { block: LessonDetail["content_blocks"][number] }) {
  const containerClasses =
    "rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl";
  const labelClasses = "text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary";

  if (block.type === "markdown") {
    return (
      <section className={containerClasses}>
        <p className={labelClasses}>{block.title || "Lesson notes"}</p>
        <div className="mt-5 prose prose-sm text-text-secondary leading-relaxed">
          <pre className="whitespace-pre-wrap font-sans">{String(block.content.body ?? "")}</pre>
        </div>
      </section>
    );
  }

  if (block.type === "code") {
    return (
      <section className={containerClasses}>
        <div className="flex items-center justify-between">
          <p className={labelClasses}>{block.title || "Code example"}</p>
          <span className="rounded bg-surface-inset px-2 py-0.5 text-[10px] font-bold text-text-tertiary border border-border">
            {String(block.content.language ?? "text")}
          </span>
        </div>
        <pre className="mt-5 overflow-x-auto rounded-lg bg-surface-inset p-5 text-xs font-mono text-text-primary shadow-inner border border-border">
          <code>{String(block.content.snippet ?? "")}</code>
        </pre>
      </section>
    );
  }

  if (block.type === "embed") {
    return (
      <section className={containerClasses}>
        <p className={labelClasses}>{block.title || "Embedded resource"}</p>
        <div className="mt-5 rounded-lg border border-dashed border-border-strong bg-surface-inset px-5 py-16 text-center shadow-inner">
          <p className="text-sm font-medium text-text-secondary">External Content</p>
          <p className="mt-1 text-xs text-text-tertiary truncate">
            {String(block.content.url ?? "")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={containerClasses}>
      <p className={labelClasses}>{block.title || "Resource"}</p>
      <a
        href={String(block.content.url ?? "#")}
        target="_blank"
        rel="noreferrer"
        className="mt-5 flex items-center justify-between rounded-lg bg-primary-soft px-5 py-4 text-sm font-bold text-primary transition hover:bg-primary/20 border border-primary-border"
      >
        <span>{String(block.content.label ?? block.content.url ?? "Open resource")}</span>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </section>
  );
}
