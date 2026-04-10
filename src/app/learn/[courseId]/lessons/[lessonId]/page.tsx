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
  if (value >= 100) return "bg-[oklch(0.72_0.13_160/0.9)]";
  if (value >= 67) return "bg-[oklch(0.74_0.12_210/0.9)]";
  if (value >= 34) return "bg-[oklch(0.84_0.08_85/0.9)]";
  return "bg-(--surface-inset)";
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
    <main className="relative min-h-screen overflow-hidden bg-(--bg) text-(--text-primary)">
      <div className="absolute inset-0 bg-(image:--gradient-page)" />
      <div className="relative mx-auto flex min-h-screen max-w-400 flex-col px-4 py-5 sm:px-6 lg:px-8">
        {course && lesson ? (
          <div className="grid flex-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
            <aside className="rounded-4xl border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                Progress map
              </p>
              <h2 className="mt-2 text-xl font-semibold">{course.title}</h2>
              <div className="mt-5 space-y-4">
                {course.sections.map((section) => (
                  <div key={section.id}>
                    <p className="text-sm font-semibold">
                      {section.position}. {section.title}
                    </p>
                    <div className="mt-3 space-y-2">
                      {section.lessons.map((item) => {
                        const progress = item.progresses?.[0];
                        return (
                          <Link
                            key={item.id}
                            href={`/learn/${course.id}/lessons/${item.id}`}
                            className={`block rounded-2xl border px-3 py-3 ${
                              item.id === lesson.id
                                ? "border-(--border-accent) bg-(--surface-raised)"
                                : "border-(--border) bg-(--surface)"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-medium">{item.title}</span>
                              <span className="text-[10px] uppercase tracking-[0.16em] text-(--text-tertiary)">
                                {item.type}
                              </span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-(--surface-inset)">
                              <div
                                className={`h-full rounded-full ${progressTone(progress?.progress_percent ?? 0)} ${progressWidthClass(progress?.progress_percent ?? 0)}`}
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

            <section className="space-y-4">
              <header className="rounded-4xl border border-(--border-accent) bg-(--surface-glass) p-6 shadow-(--shadow-lg) backdrop-blur-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                      {lesson.type} lesson
                    </p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight">{lesson.title}</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-(--text-secondary)">
                      {lesson.description ||
                        "Follow the lesson materials and update progress as you go."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => void markProgress("in_progress")}
                      className="rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-medium"
                    >
                      Save progress
                    </button>
                    <button
                      onClick={() => void markProgress("completed")}
                      className="rounded-full bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-contrast)"
                    >
                      Mark complete
                    </button>
                  </div>
                </div>
              </header>

              {message ? (
                <div className="rounded-3xl border border-(--border-accent) bg-(--surface) px-5 py-3 text-sm">
                  {message}
                </div>
              ) : null}

              {lesson.type === "article" ||
              lesson.type === "video" ||
              lesson.type === "live_session" ? (
                <div className="space-y-4">
                  {lesson.content_blocks.map((block) => (
                    <LearnerBlock key={block.id} block={block} />
                  ))}
                </div>
              ) : null}

              {lesson.type === "quiz" && assessment ? (
                <div className="rounded-4xl border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                    Quiz
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{assessment.title}</h2>
                  <div className="mt-5 space-y-4">
                    {assessment.questions.map((question) => (
                      <div
                        key={question.id}
                        className="rounded-3xl border border-(--border) bg-(--surface) p-4"
                      >
                        <p className="text-sm font-semibold">{question.prompt}</p>
                        <div className="mt-3 space-y-2">
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
                                  className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm ${
                                    selected
                                      ? "border-(--border-accent) bg-(--surface-raised)"
                                      : "border-(--border) bg-(--surface-inset)"
                                  }`}
                                >
                                  <input
                                    type={question.type === "single_choice" ? "radio" : "checkbox"}
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
                                  />
                                  <span>{option.content}</span>
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
                              className="min-h-24 w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-4 py-3 text-sm outline-none"
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
                              className="min-h-40 w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-4 py-3 font-mono text-xs outline-none"
                            />
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => void submitQuiz()}
                    className="mt-5 rounded-full bg-(--primary) px-5 py-3 text-sm font-semibold text-(--primary-contrast)"
                  >
                    Submit quiz
                  </button>
                </div>
              ) : null}

              {lesson.type === "coding_lab" && exercise ? (
                <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                    Coding lab
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{exercise.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-(--text-secondary)">
                    {exercise.prompt}
                  </p>
                  <textarea
                    value={codeAnswer}
                    onChange={(event) => setCodeAnswer(event.target.value)}
                    className="mt-5 min-h-[360px] w-full rounded-[1.5rem] border border-(--border) bg-(--surface) px-4 py-4 font-mono text-xs outline-none"
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => void submitCodingExercise()}
                      className="rounded-full bg-(--primary) px-5 py-3 text-sm font-semibold text-(--primary-contrast)"
                    >
                      Submit solution
                    </button>
                    <button
                      onClick={() => setCodeAnswer(exercise.starter_code ?? "")}
                      className="rounded-full border border-(--border) bg-(--surface) px-5 py-3 text-sm font-medium"
                    >
                      Reset starter code
                    </button>
                  </div>
                </div>
              ) : null}
            </section>

            <aside className="space-y-4">
              <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
                <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                  Status
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-2xl bg-(--surface) px-4 py-3">
                    Progress: {currentProgress?.progress_percent ?? 0}%
                  </div>
                  <div className="rounded-2xl bg-(--surface) px-4 py-3">
                    State: {currentProgress?.status ?? "not_started"}
                  </div>
                  <div className="rounded-2xl bg-(--surface) px-4 py-3">
                    Time: {lesson.estimated_minutes ?? 0} min
                  </div>
                </div>
              </div>

              {nextLesson ? (
                <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                    Up next
                  </p>
                  <p className="mt-3 text-lg font-semibold">{nextLesson.title}</p>
                  <p className="mt-2 text-sm text-(--text-secondary)">
                    Move directly into the next lesson when you finish here.
                  </p>
                  <Link
                    href={`/learn/${course.id}/lessons/${nextLesson.id}`}
                    className="mt-4 inline-flex rounded-full bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-contrast)"
                  >
                    Open next lesson
                  </Link>
                </div>
              ) : (
                <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
                  <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                    Final lesson
                  </p>
                  <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
                    You’re at the end of this path. Completion is already tracked, and certificate
                    logic can be added later without changing learner progression.
                  </p>
                </div>
              )}
            </aside>
          </div>
        ) : (
          <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-8 text-sm text-(--text-secondary)">
            Loading lesson…
          </div>
        )}
      </div>
    </main>
  );
}

function LearnerBlock({ block }: { block: LessonDetail["content_blocks"][number] }) {
  if (block.type === "markdown") {
    return (
      <section className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-6 shadow-(--shadow-md) backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-(--text-tertiary)">
          {block.title || "Lesson notes"}
        </p>
        <pre className="mt-4 whitespace-pre-wrap text-sm leading-8 text-(--text-secondary)">
          {String(block.content.body ?? "")}
        </pre>
      </section>
    );
  }

  if (block.type === "code") {
    return (
      <section className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-6 shadow-(--shadow-md) backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-(--text-tertiary)">
          {block.title || "Code example"} • {String(block.content.language ?? "text")}
        </p>
        <pre className="mt-4 overflow-x-auto rounded-[1.5rem] bg-(--surface) p-4 text-xs text-(--text-primary)">
          {String(block.content.snippet ?? "")}
        </pre>
      </section>
    );
  }

  if (block.type === "embed") {
    return (
      <section className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-6 shadow-(--shadow-md) backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.2em] text-(--text-tertiary)">
          {block.title || "Embedded resource"}
        </p>
        <div className="mt-4 rounded-[1.5rem] border border-dashed border-(--border-accent) bg-(--surface) px-5 py-12 text-center text-sm text-(--text-secondary)">
          External embed: {String(block.content.url ?? "")}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-6 shadow-(--shadow-md) backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.2em] text-(--text-tertiary)">
        {block.title || "Resource"}
      </p>
      <a
        href={String(block.content.url ?? "#")}
        target="_blank"
        rel="noreferrer"
        className="mt-4 block rounded-[1.5rem] bg-(--surface) px-5 py-4 text-sm font-medium text-(--primary)"
      >
        {String(block.content.label ?? block.content.url ?? "Open resource")}
      </a>
    </section>
  );
}
