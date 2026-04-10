"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { useApi } from "@/src/infra/api/api.context";
import { useAuth } from "@/src/infra/auth/auth.context";

type CourseSummary = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  status: "draft" | "published" | "archived";
  level: "beginner" | "intermediate" | "advanced";
  estimated_minutes: number | null;
};

type ContentBlock = {
  id: string;
  type: "markdown" | "code" | "embed" | "resource";
  title: string | null;
  content: Record<string, unknown>;
  position: number;
};

type QuestionOption = {
  id: string;
  label: string | null;
  content: string;
  position: number;
  is_correct: boolean;
};

type AssessmentQuestion = {
  id: string;
  prompt: string;
  type: "single_choice" | "multiple_choice" | "short_text" | "code";
  position: number;
  points: number;
  explanation: string | null;
  correct_text_answer: string | null;
  code_template: string | null;
  code_language: string | null;
  options: QuestionOption[];
};

type AssessmentSummary = {
  id: string;
  title: string;
  type: "practice" | "graded" | "final_exam";
  passing_score: number | null;
  max_attempts: number | null;
  time_limit_mins: number | null;
  is_published: boolean;
};

type CodingExercise = {
  id: string;
  title: string;
  prompt: string;
  starter_code: string | null;
  solution_code: string | null;
  language: string;
  max_score: number;
};

type LessonDetail = {
  id: string;
  section_id: string;
  title: string;
  slug: string;
  description: string | null;
  type: "video" | "article" | "live_session" | "quiz" | "coding_lab";
  position: number;
  estimated_minutes: number | null;
  is_preview: boolean;
  content_blocks: ContentBlock[];
  assessments: AssessmentSummary[];
  coding_exercises: CodingExercise[];
};

type SectionSummary = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  lessons: Array<{
    id: string;
    title: string;
    slug: string;
    type: LessonDetail["type"];
    position: number;
    estimated_minutes: number | null;
    is_preview: boolean;
  }>;
};

type CourseDetail = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  thumbnail_url: string | null;
  estimated_minutes: number | null;
  level: CourseSummary["level"];
  status: CourseSummary["status"];
  sections: SectionSummary[];
};

type AssessmentDetail = {
  id: string;
  title: string;
  description: string | null;
  type: AssessmentSummary["type"];
  passing_score: number | null;
  max_attempts: number | null;
  time_limit_mins: number | null;
  is_published: boolean;
  questions: AssessmentQuestion[];
};

const contentBlockTemplates = {
  markdown: { body: "## Lesson heading\n\nIntroduce the concept with concise copy." },
  code: {
    language: "typescript",
    snippet: "export function greet(name: string) {\n  return `Hello, ${name}`;\n}",
  },
  embed: { url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", caption: "External embed" },
  resource: { label: "Reference", url: "https://www.typescriptlang.org/docs/" },
} satisfies Record<ContentBlock["type"], Record<string, unknown>>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function InstructorPage() {
  const api = useApi();
  const { user, isLoading, logout } = useAuth();
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [lessonDetail, setLessonDetail] = useState<LessonDetail | null>(null);
  const [assessmentDetail, setAssessmentDetail] = useState<AssessmentDetail | null>(null);
  const [message, setMessage] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<boolean>(true);

  const [courseForm, setCourseForm] = useState({
    title: "",
    slug: "",
    summary: "",
    description: "",
    estimated_minutes: "90",
    level: "beginner" as CourseSummary["level"],
    status: "draft" as CourseSummary["status"],
  });

  const [sectionForm, setSectionForm] = useState({
    title: "",
    description: "",
    position: "1",
  });

  const [lessonForm, setLessonForm] = useState({
    title: "",
    slug: "",
    description: "",
    type: "article" as LessonDetail["type"],
    position: "1",
    estimated_minutes: "15",
    is_preview: false,
  });

  const [blockForm, setBlockForm] = useState({
    type: "markdown" as ContentBlock["type"],
    title: "",
    position: "1",
    content: JSON.stringify(contentBlockTemplates.markdown, null, 2),
  });

  const [assessmentForm, setAssessmentForm] = useState({
    title: "",
    description: "",
    type: "practice" as AssessmentSummary["type"],
    passing_score: "70",
    max_attempts: "3",
    time_limit_mins: "10",
    is_published: false,
  });

  const [questionForm, setQuestionForm] = useState({
    prompt: "",
    type: "single_choice" as AssessmentQuestion["type"],
    position: "1",
    points: "1",
    explanation: "",
    correct_text_answer: "",
    code_template: "",
    code_language: "typescript",
    options: "A|Correct answer|true\nB|Distractor|false",
  });

  const [exerciseForm, setExerciseForm] = useState({
    title: "",
    prompt: "",
    starter_code: "export function solve(input: string) {\n  return input;\n}",
    solution_code: "export function solve(input: string): string {\n  return input.trim();\n}",
    language: "typescript",
    max_score: "100",
  });

  useEffect(() => {
    if (!user || (user.role !== "instructor" && user.role !== "admin")) {
      return;
    }

    void loadCourses();
  }, [user]);

  useEffect(() => {
    if (selectedCourseId) {
      void loadCourseDetail(selectedCourseId);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedLessonId) {
      void loadLessonDetail(selectedLessonId);
    } else {
      setLessonDetail(null);
    }
  }, [selectedLessonId]);

  useEffect(() => {
    if (selectedAssessmentId) {
      void loadAssessmentDetail(selectedAssessmentId);
    } else {
      setAssessmentDetail(null);
    }
  }, [selectedAssessmentId]);

  useEffect(() => {
    if (!lessonDetail) {
      return;
    }

    setLessonForm({
      title: lessonDetail.title,
      slug: lessonDetail.slug,
      description: lessonDetail.description ?? "",
      type: lessonDetail.type,
      position: String(lessonDetail.position),
      estimated_minutes: String(lessonDetail.estimated_minutes ?? 15),
      is_preview: lessonDetail.is_preview,
    });

    const nextPosition = lessonDetail.content_blocks.length + 1;
    setBlockForm((current) => ({
      ...current,
      position: String(nextPosition),
    }));

    if (lessonDetail.assessments[0] && !selectedAssessmentId) {
      setSelectedAssessmentId(lessonDetail.assessments[0].id);
    }
  }, [lessonDetail, selectedAssessmentId]);

  useEffect(() => {
    if (!assessmentDetail) {
      return;
    }

    setAssessmentForm({
      title: assessmentDetail.title,
      description: assessmentDetail.description ?? "",
      type: assessmentDetail.type,
      passing_score: String(assessmentDetail.passing_score ?? 70),
      max_attempts: String(assessmentDetail.max_attempts ?? 3),
      time_limit_mins: String(assessmentDetail.time_limit_mins ?? 10),
      is_published: assessmentDetail.is_published,
    });
  }, [assessmentDetail]);

  const previewBlocks = useMemo(() => lessonDetail?.content_blocks ?? [], [lessonDetail]);

  async function loadCourses() {
    const query =
      user?.role === "admin"
        ? "/api/courses"
        : `/api/courses?creatorId=${encodeURIComponent(user?.id ?? "")}`;
    const result = await api.get<CourseSummary[]>(query);
    setCourses(result);
    if (!selectedCourseId && result[0]) {
      setSelectedCourseId(result[0].id);
    }
  }

  async function loadCourseDetail(courseId: string) {
    const result = await api.get<CourseDetail>(`/api/courses/${courseId}`);
    setCourseDetail(result);
    setCourseForm({
      title: result.title,
      slug: result.slug,
      summary: result.summary ?? "",
      description: result.description ?? "",
      estimated_minutes: String(result.estimated_minutes ?? 90),
      level: result.level,
      status: result.status,
    });
    const firstLesson = result.sections.flatMap((section) => section.lessons)[0];
    setSelectedLessonId(firstLesson?.id ?? null);
  }

  async function loadLessonDetail(lessonId: string) {
    const result = await api.get<LessonDetail>(`/api/lessons/${lessonId}`);
    setLessonDetail(result);
  }

  async function loadAssessmentDetail(assessmentId: string) {
    const result = await api.get<AssessmentDetail>(`/api/assessments/${assessmentId}`);
    setAssessmentDetail(result);
  }

  async function handleCourseCreate(event: FormEvent) {
    event.preventDefault();
    const created = await api.post<CourseDetail>("/api/courses", {
      title: courseForm.title,
      slug: courseForm.slug || slugify(courseForm.title),
      summary: courseForm.summary,
      description: courseForm.description,
      estimated_minutes: Number(courseForm.estimated_minutes),
      level: courseForm.level,
      status: courseForm.status,
    });
    setMessage(`Created course ${created.title}`);
    await loadCourses();
    setSelectedCourseId(created.id);
  }

  async function handleCourseUpdate() {
    if (!courseDetail) return;
    await api.patch(`/api/courses/${courseDetail.id}`, {
      title: courseForm.title,
      slug: courseForm.slug || slugify(courseForm.title),
      summary: courseForm.summary,
      description: courseForm.description,
      estimated_minutes: Number(courseForm.estimated_minutes),
      level: courseForm.level,
      status: courseForm.status,
    });
    setMessage(`Updated ${courseForm.title}`);
    await loadCourses();
    await loadCourseDetail(courseDetail.id);
  }

  async function handleSectionCreate(event: FormEvent) {
    event.preventDefault();
    if (!courseDetail) return;
    await api.post(`/api/courses/${courseDetail.id}/sections`, {
      title: sectionForm.title,
      description: sectionForm.description,
      position: Number(sectionForm.position),
    });
    setSectionForm({
      title: "",
      description: "",
      position: String((courseDetail.sections.length || 0) + 1),
    });
    setMessage("Section created");
    await loadCourseDetail(courseDetail.id);
  }

  async function handleLessonCreate(sectionId: string) {
    await api.post(`/api/sections/${sectionId}/lessons`, {
      title: lessonForm.title,
      slug: lessonForm.slug || slugify(lessonForm.title),
      description: lessonForm.description,
      type: lessonForm.type,
      position: Number(lessonForm.position),
      estimated_minutes: Number(lessonForm.estimated_minutes),
      is_preview: lessonForm.is_preview,
    });
    setMessage("Lesson created");
    if (courseDetail) {
      await loadCourseDetail(courseDetail.id);
    }
  }

  async function handleLessonUpdate() {
    if (!lessonDetail) return;
    await api.patch(`/api/lessons/${lessonDetail.id}`, {
      title: lessonForm.title,
      slug: lessonForm.slug || slugify(lessonForm.title),
      description: lessonForm.description,
      type: lessonForm.type,
      position: Number(lessonForm.position),
      estimated_minutes: Number(lessonForm.estimated_minutes),
      is_preview: lessonForm.is_preview,
    });
    setMessage("Lesson updated");
    await loadLessonDetail(lessonDetail.id);
    if (courseDetail) {
      await loadCourseDetail(courseDetail.id);
    }
  }

  async function handleBlockCreate() {
    if (!lessonDetail) return;
    await api.post(`/api/lessons/${lessonDetail.id}/content-blocks`, {
      type: blockForm.type,
      title: blockForm.title,
      position: Number(blockForm.position),
      content: JSON.parse(blockForm.content),
    });
    setMessage("Content block saved");
    await loadLessonDetail(lessonDetail.id);
  }

  async function handleBlockDelete(blockId: string) {
    await api.del(`/api/content-blocks/${blockId}`);
    setMessage("Content block deleted");
    if (lessonDetail) {
      await loadLessonDetail(lessonDetail.id);
    }
  }

  async function handleAssessmentCreate() {
    if (!courseDetail || !lessonDetail) return;
    const created = await api.post<AssessmentSummary>(
      `/api/courses/${courseDetail.id}/assessments`,
      {
        title: assessmentForm.title,
        description: assessmentForm.description,
        lesson_id: lessonDetail.id,
        type: assessmentForm.type,
        passing_score: Number(assessmentForm.passing_score),
        max_attempts: Number(assessmentForm.max_attempts),
        time_limit_mins: Number(assessmentForm.time_limit_mins),
        is_published: assessmentForm.is_published,
      },
    );
    setSelectedAssessmentId(created.id);
    setMessage("Quiz created");
    await loadLessonDetail(lessonDetail.id);
    await loadAssessmentDetail(created.id);
  }

  async function handleAssessmentUpdate() {
    if (!assessmentDetail) return;
    await api.patch(`/api/assessments/${assessmentDetail.id}`, {
      title: assessmentForm.title,
      description: assessmentForm.description,
      type: assessmentForm.type,
      passing_score: Number(assessmentForm.passing_score),
      max_attempts: Number(assessmentForm.max_attempts),
      time_limit_mins: Number(assessmentForm.time_limit_mins),
      is_published: assessmentForm.is_published,
    });
    setMessage("Quiz updated");
    await loadAssessmentDetail(assessmentDetail.id);
    if (lessonDetail) {
      await loadLessonDetail(lessonDetail.id);
    }
  }

  async function handleQuestionCreate() {
    if (!assessmentDetail) return;
    await api.post(`/api/assessments/${assessmentDetail.id}/questions`, {
      prompt: questionForm.prompt,
      type: questionForm.type,
      position: Number(questionForm.position),
      points: Number(questionForm.points),
      explanation: questionForm.explanation,
      correct_text_answer: questionForm.correct_text_answer || undefined,
      code_template: questionForm.code_template || undefined,
      code_language: questionForm.code_language || undefined,
      options:
        questionForm.type === "single_choice" || questionForm.type === "multiple_choice"
          ? questionForm.options
              .split("\n")
              .filter(Boolean)
              .map((row, index) => {
                const [label, content, isCorrect] = row.split("|");
                return {
                  label,
                  content,
                  position: index + 1,
                  is_correct: isCorrect === "true",
                };
              })
          : undefined,
    });
    setMessage("Question created");
    await loadAssessmentDetail(assessmentDetail.id);
  }

  async function handleQuestionDelete(questionId: string) {
    await api.del(`/api/assessment-questions/${questionId}`);
    setMessage("Question deleted");
    if (assessmentDetail) {
      await loadAssessmentDetail(assessmentDetail.id);
    }
  }

  async function handleExerciseCreate() {
    if (!lessonDetail) return;
    await api.post(`/api/lessons/${lessonDetail.id}/coding-exercises`, {
      title: exerciseForm.title,
      prompt: exerciseForm.prompt,
      starter_code: exerciseForm.starter_code,
      solution_code: exerciseForm.solution_code,
      language: exerciseForm.language,
      max_score: Number(exerciseForm.max_score),
      test_cases: [
        { input: "sample", expected: "sample", description: "Replace this with actual tests" },
      ],
    });
    setMessage("Coding exercise created");
    await loadLessonDetail(lessonDetail.id);
  }

  if (isLoading) {
    return <main className="min-h-screen bg-(--bg) text-(--text-primary) p-8">Loading…</main>;
  }

  if (!user || (user.role !== "instructor" && user.role !== "admin")) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-(--bg) text-(--text-primary)">
        <div className="absolute inset-0 bg-(image:--gradient-page)" />
        <div className="relative mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 py-12">
          <section className="w-full max-w-2xl rounded-4xl border border-(--border) bg-(--surface-glass) p-8 shadow-(--shadow-lg) backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.24em] text-(--text-secondary)">
              Restricted
            </p>
            <h1 className="mt-3 text-4xl font-semibold">Instructor access required</h1>
            <p className="mt-4 text-base leading-7 text-(--text-secondary)">
              This area is available only to instructors and admins. Sign in with an elevated role
              or return to the learner workspace.
            </p>
            <div className="mt-8 flex gap-3">
              <a
                href="/workspace"
                className="rounded-full border border-(--border) bg-(--surface) px-5 py-3 text-sm font-medium text-(--text-primary)"
              >
                Go to workspace
              </a>
              <button
                onClick={() => void logout()}
                className="rounded-full bg-(--primary) px-5 py-3 text-sm font-semibold text-(--primary-contrast)"
              >
                Switch account
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-(--bg) text-(--text-primary)">
      <div className="absolute inset-0 bg-(image:--gradient-page)" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,oklch(0.74_0.12_210/0.24),transparent_70%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-(--border-accent) bg-(--surface-glass) px-6 py-5 shadow-(--shadow-lg) backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-(--text-secondary)">
              Instructor Studio
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Structured lesson editor</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-(--text-secondary)">
              Build courses, arrange lessons, manage quizzes and coding labs, and preview the
              learner experience from one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setPreviewMode((current) => !current)}
              className="rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-medium text-(--text-primary)"
            >
              {previewMode ? "Hide preview" : "Show preview"}
            </button>
            <a
              href="/workspace"
              className="rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-medium text-(--text-primary)"
            >
              Workspace
            </a>
          </div>
        </header>

        {message ? (
          <div className="rounded-3xl border border-(--border-accent) bg-(--surface-raised) px-5 py-3 text-sm text-(--text-primary) shadow-(--shadow-sm)">
            {message}
          </div>
        ) : null}

        <div className="grid flex-1 gap-4 xl:grid-cols-[320px_minmax(0,1fr)_380px]">
          <aside className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                  Catalog
                </p>
                <h2 className="mt-2 text-xl font-semibold">Courses</h2>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`w-full rounded-3xl border px-4 py-4 text-left transition ${
                    selectedCourseId === course.id
                      ? "border-(--border-accent) bg-(--surface-raised)"
                      : "border-(--border) bg-(--surface)"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{course.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-(--text-tertiary)">
                        /{course.slug}
                      </p>
                    </div>
                    <span className="rounded-full bg-(--surface-accent) px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-(--text-primary)">
                      {course.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-(--text-secondary)">
                    {course.summary || "No summary yet"}
                  </p>
                </button>
              ))}
            </div>

            <form
              onSubmit={handleCourseCreate}
              className="mt-6 space-y-3 rounded-3xl border border-(--border) bg-(--surface) p-4"
            >
              <p className="text-sm font-semibold">Create course</p>
              <input
                value={courseForm.title}
                onChange={(event) =>
                  setCourseForm((current) => ({
                    ...current,
                    title: event.target.value,
                    slug: current.slug ? current.slug : slugify(event.target.value),
                  }))
                }
                placeholder="Course title"
                className="w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
              />
              <input
                value={courseForm.slug}
                onChange={(event) =>
                  setCourseForm((current) => ({ ...current, slug: slugify(event.target.value) }))
                }
                placeholder="course-slug"
                className="w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
              />
              <textarea
                value={courseForm.summary}
                onChange={(event) =>
                  setCourseForm((current) => ({ ...current, summary: event.target.value }))
                }
                placeholder="Short summary"
                className="min-h-24 w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
              />
              <button className="w-full rounded-2xl bg-(--primary) px-4 py-3 text-sm font-semibold text-(--primary-contrast)">
                Create course
              </button>
            </form>
          </aside>

          <section className="space-y-4">
            <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                    Course settings
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {courseDetail?.title || "Select a course"}
                  </h2>
                </div>
                {courseDetail ? (
                  <button
                    onClick={() => void handleCourseUpdate()}
                    className="rounded-full bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-contrast)"
                  >
                    Save course
                  </button>
                ) : null}
              </div>

              {courseDetail ? (
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <Field label="Title">
                    <input
                      value={courseForm.title}
                      onChange={(event) =>
                        setCourseForm((current) => ({
                          ...current,
                          title: event.target.value,
                          slug: slugify(event.target.value),
                        }))
                      }
                      className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm outline-none"
                    />
                  </Field>
                  <Field label="Slug">
                    <input
                      value={courseForm.slug}
                      onChange={(event) =>
                        setCourseForm((current) => ({
                          ...current,
                          slug: slugify(event.target.value),
                        }))
                      }
                      className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm outline-none"
                    />
                  </Field>
                  <Field label="Summary" className="lg:col-span-2">
                    <textarea
                      value={courseForm.summary}
                      onChange={(event) =>
                        setCourseForm((current) => ({ ...current, summary: event.target.value }))
                      }
                      className="min-h-24 w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm outline-none"
                    />
                  </Field>
                  <Field label="Description" className="lg:col-span-2">
                    <textarea
                      value={courseForm.description}
                      onChange={(event) =>
                        setCourseForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      className="min-h-32 w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm outline-none"
                    />
                  </Field>
                  <Field label="Status">
                    <select
                      value={courseForm.status}
                      onChange={(event) =>
                        setCourseForm((current) => ({
                          ...current,
                          status: event.target.value as CourseSummary["status"],
                        }))
                      }
                      className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </Field>
                  <Field label="Level">
                    <select
                      value={courseForm.level}
                      onChange={(event) =>
                        setCourseForm((current) => ({
                          ...current,
                          level: event.target.value as CourseSummary["level"],
                        }))
                      }
                      className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm outline-none"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </Field>
                </div>
              ) : (
                <p className="mt-5 text-sm text-(--text-secondary)">
                  Choose a course from the left sidebar to begin editing.
                </p>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
              <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                      Structure
                    </p>
                    <h3 className="mt-2 text-xl font-semibold">Sections and lessons</h3>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {courseDetail?.sections.map((section) => (
                    <div
                      key={section.id}
                      className="rounded-3xl border border-(--border) bg-(--surface) p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">
                            {section.position}. {section.title}
                          </p>
                          <p className="text-xs text-(--text-secondary)">
                            {section.description || "No description"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        {section.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setSelectedLessonId(lesson.id);
                              setSelectedAssessmentId(null);
                            }}
                            className={`w-full rounded-2xl border px-3 py-3 text-left ${
                              selectedLessonId === lesson.id
                                ? "border-(--border-accent) bg-(--surface-raised)"
                                : "border-(--border) bg-(--surface-inset)"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-medium">
                                {lesson.position}. {lesson.title}
                              </p>
                              <span className="rounded-full bg-(--surface-accent) px-2 py-1 text-[10px] uppercase tracking-[0.18em]">
                                {lesson.type}
                              </span>
                            </div>
                            <p className="mt-2 text-xs uppercase tracking-[0.16em] text-(--text-tertiary)">
                              /{lesson.slug} {lesson.is_preview ? "• preview enabled" : ""}
                            </p>
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => void handleLessonCreate(section.id)}
                        className="mt-3 w-full rounded-2xl border border-dashed border-(--border-accent) bg-(--surface-raised) px-4 py-3 text-sm font-medium"
                      >
                        Add lesson using current lesson form
                      </button>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleSectionCreate}
                  className="mt-5 space-y-3 rounded-3xl border border-(--border) bg-(--surface) p-4"
                >
                  <p className="text-sm font-semibold">Add section</p>
                  <input
                    value={sectionForm.title}
                    onChange={(event) =>
                      setSectionForm((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="Section title"
                    className="w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                  />
                  <textarea
                    value={sectionForm.description}
                    onChange={(event) =>
                      setSectionForm((current) => ({ ...current, description: event.target.value }))
                    }
                    placeholder="Section description"
                    className="min-h-24 w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                  />
                  <input
                    value={sectionForm.position}
                    onChange={(event) =>
                      setSectionForm((current) => ({ ...current, position: event.target.value }))
                    }
                    placeholder="Position"
                    type="number"
                    className="w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                  />
                  <button className="w-full rounded-2xl bg-(--primary) px-4 py-3 text-sm font-semibold text-(--primary-contrast)">
                    Add section
                  </button>
                </form>
              </div>

              <div className="space-y-4">
                <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                        Lesson editor
                      </p>
                      <h3 className="mt-2 text-xl font-semibold">
                        {lessonDetail ? lessonDetail.title : "Select a lesson"}
                      </h3>
                    </div>
                    {lessonDetail ? (
                      <button
                        onClick={() => void handleLessonUpdate()}
                        className="rounded-full bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-contrast)"
                      >
                        Save lesson
                      </button>
                    ) : null}
                  </div>

                  {lessonDetail ? (
                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <Field label="Title">
                        <input
                          value={lessonForm.title}
                          onChange={(event) =>
                            setLessonForm((current) => ({
                              ...current,
                              title: event.target.value,
                              slug: slugify(event.target.value),
                            }))
                          }
                          className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm outline-none"
                        />
                      </Field>
                      <Field label="Slug">
                        <input
                          value={lessonForm.slug}
                          onChange={(event) =>
                            setLessonForm((current) => ({
                              ...current,
                              slug: slugify(event.target.value),
                            }))
                          }
                          className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm outline-none"
                        />
                      </Field>
                      <Field label="Description" className="lg:col-span-2">
                        <textarea
                          value={lessonForm.description}
                          onChange={(event) =>
                            setLessonForm((current) => ({
                              ...current,
                              description: event.target.value,
                            }))
                          }
                          className="min-h-24 w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm outline-none"
                        />
                      </Field>
                      <Field label="Type">
                        <select
                          value={lessonForm.type}
                          onChange={(event) =>
                            setLessonForm((current) => ({
                              ...current,
                              type: event.target.value as LessonDetail["type"],
                            }))
                          }
                          className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm outline-none"
                        >
                          <option value="article">Article</option>
                          <option value="video">Video</option>
                          <option value="live_session">Live session</option>
                          <option value="quiz">Quiz</option>
                          <option value="coding_lab">Coding lab</option>
                        </select>
                      </Field>
                      <Field label="Position">
                        <input
                          type="number"
                          value={lessonForm.position}
                          onChange={(event) =>
                            setLessonForm((current) => ({
                              ...current,
                              position: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm outline-none"
                        />
                      </Field>
                      <Field label="Estimated minutes">
                        <input
                          type="number"
                          value={lessonForm.estimated_minutes}
                          onChange={(event) =>
                            setLessonForm((current) => ({
                              ...current,
                              estimated_minutes: event.target.value,
                            }))
                          }
                          className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm outline-none"
                        />
                      </Field>
                      <label className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm">
                        <input
                          type="checkbox"
                          checked={lessonForm.is_preview}
                          onChange={(event) =>
                            setLessonForm((current) => ({
                              ...current,
                              is_preview: event.target.checked,
                            }))
                          }
                          className="h-4 w-4 rounded border-(--border-strong)"
                        />
                        <span>Preview mode enabled for learners</span>
                      </label>
                    </div>
                  ) : (
                    <p className="mt-5 text-sm text-(--text-secondary)">
                      Pick a lesson from the structure panel to edit ordering, preview, slug, and
                      lesson-specific content.
                    </p>
                  )}
                </div>

                {lessonDetail ? (
                  <>
                    <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                            Content blocks
                          </p>
                          <h3 className="mt-2 text-xl font-semibold">Structured lesson content</h3>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
                        <div className="space-y-3">
                          {lessonDetail.content_blocks.map((block) => (
                            <div
                              key={block.id}
                              className="rounded-3xl border border-(--border) bg-(--surface) p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold">
                                    {block.position}. {block.title || block.type}
                                  </p>
                                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-(--text-tertiary)">
                                    {block.type}
                                  </p>
                                </div>
                                <button
                                  onClick={() => void handleBlockDelete(block.id)}
                                  className="rounded-full border border-(--border) px-3 py-1 text-xs uppercase tracking-[0.18em] text-(--text-secondary)"
                                >
                                  Delete
                                </button>
                              </div>
                              <pre className="mt-3 overflow-x-auto rounded-2xl bg-(--surface-inset) p-3 text-xs text-(--text-secondary)">
                                {JSON.stringify(block.content, null, 2)}
                              </pre>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-3xl border border-(--border) bg-(--surface) p-4">
                          <p className="text-sm font-semibold">Add block</p>
                          <div className="mt-3 space-y-3">
                            <select
                              value={blockForm.type}
                              onChange={(event) => {
                                const nextType = event.target.value as ContentBlock["type"];
                                setBlockForm((current) => ({
                                  ...current,
                                  type: nextType,
                                  content: JSON.stringify(contentBlockTemplates[nextType], null, 2),
                                }));
                              }}
                              className="w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                            >
                              <option value="markdown">Markdown</option>
                              <option value="code">Code</option>
                              <option value="embed">Embed</option>
                              <option value="resource">Resource</option>
                            </select>
                            <input
                              value={blockForm.title}
                              onChange={(event) =>
                                setBlockForm((current) => ({
                                  ...current,
                                  title: event.target.value,
                                }))
                              }
                              placeholder="Block title"
                              className="w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                            />
                            <input
                              value={blockForm.position}
                              onChange={(event) =>
                                setBlockForm((current) => ({
                                  ...current,
                                  position: event.target.value,
                                }))
                              }
                              type="number"
                              placeholder="Position"
                              className="w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                            />
                            <textarea
                              value={blockForm.content}
                              onChange={(event) =>
                                setBlockForm((current) => ({
                                  ...current,
                                  content: event.target.value,
                                }))
                              }
                              className="min-h-56 w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 font-mono text-xs outline-none"
                            />
                            <button
                              onClick={() => void handleBlockCreate()}
                              className="w-full rounded-2xl bg-(--primary) px-4 py-3 text-sm font-semibold text-(--primary-contrast)"
                            >
                              Add content block
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {lessonForm.type === "quiz" ? (
                      <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                              Quiz builder
                            </p>
                            <h3 className="mt-2 text-xl font-semibold">
                              {assessmentDetail?.title || "Create a quiz"}
                            </h3>
                          </div>
                          {assessmentDetail ? (
                            <button
                              onClick={() => void handleAssessmentUpdate()}
                              className="rounded-full bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-contrast)"
                            >
                              Save quiz
                            </button>
                          ) : (
                            <button
                              onClick={() => void handleAssessmentCreate()}
                              className="rounded-full bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-contrast)"
                            >
                              Create quiz
                            </button>
                          )}
                        </div>

                        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                          <div className="space-y-3">
                            {assessmentDetail?.questions.map((question) => (
                              <div
                                key={question.id}
                                className="rounded-3xl border border-(--border) bg-(--surface) p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-sm font-semibold">
                                      {question.position}. {question.prompt}
                                    </p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-(--text-tertiary)">
                                      {question.type} • {question.points} pts
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => void handleQuestionDelete(question.id)}
                                    className="rounded-full border border-(--border) px-3 py-1 text-xs uppercase tracking-[0.18em] text-(--text-secondary)"
                                  >
                                    Delete
                                  </button>
                                </div>
                                {question.options.length ? (
                                  <div className="mt-3 grid gap-2">
                                    {question.options.map((option) => (
                                      <div
                                        key={option.id}
                                        className={`rounded-2xl px-3 py-2 text-sm ${
                                          option.is_correct
                                            ? "bg-[oklch(0.72_0.13_160/0.18)]"
                                            : "bg-(--surface-inset)"
                                        }`}
                                      >
                                        {option.label || "Option"}: {option.content}
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>

                          <div className="rounded-3xl border border-(--border) bg-(--surface) p-4">
                            <p className="text-sm font-semibold">Quiz settings</p>
                            <div className="mt-3 space-y-3">
                              <input
                                value={assessmentForm.title}
                                onChange={(event) =>
                                  setAssessmentForm((current) => ({
                                    ...current,
                                    title: event.target.value,
                                  }))
                                }
                                placeholder="Quiz title"
                                className="w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                              />
                              <textarea
                                value={assessmentForm.description}
                                onChange={(event) =>
                                  setAssessmentForm((current) => ({
                                    ...current,
                                    description: event.target.value,
                                  }))
                                }
                                placeholder="Quiz description"
                                className="min-h-20 w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                              />
                              <div className="grid grid-cols-3 gap-3">
                                <input
                                  value={assessmentForm.passing_score}
                                  onChange={(event) =>
                                    setAssessmentForm((current) => ({
                                      ...current,
                                      passing_score: event.target.value,
                                    }))
                                  }
                                  type="number"
                                  placeholder="Pass %"
                                  className="rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                                />
                                <input
                                  value={assessmentForm.max_attempts}
                                  onChange={(event) =>
                                    setAssessmentForm((current) => ({
                                      ...current,
                                      max_attempts: event.target.value,
                                    }))
                                  }
                                  type="number"
                                  placeholder="Attempts"
                                  className="rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                                />
                                <input
                                  value={assessmentForm.time_limit_mins}
                                  onChange={(event) =>
                                    setAssessmentForm((current) => ({
                                      ...current,
                                      time_limit_mins: event.target.value,
                                    }))
                                  }
                                  type="number"
                                  placeholder="Minutes"
                                  className="rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                                />
                              </div>
                              <label className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={assessmentForm.is_published}
                                  onChange={(event) =>
                                    setAssessmentForm((current) => ({
                                      ...current,
                                      is_published: event.target.checked,
                                    }))
                                  }
                                  className="h-4 w-4 rounded"
                                />
                                Publish quiz
                              </label>
                              <hr className="border-(--border)" />
                              <p className="text-sm font-semibold">Add question</p>
                              <textarea
                                value={questionForm.prompt}
                                onChange={(event) =>
                                  setQuestionForm((current) => ({
                                    ...current,
                                    prompt: event.target.value,
                                  }))
                                }
                                placeholder="Prompt"
                                className="min-h-20 w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                              />
                              <div className="grid grid-cols-3 gap-3">
                                <select
                                  value={questionForm.type}
                                  onChange={(event) =>
                                    setQuestionForm((current) => ({
                                      ...current,
                                      type: event.target.value as AssessmentQuestion["type"],
                                    }))
                                  }
                                  className="rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                                >
                                  <option value="single_choice">Single</option>
                                  <option value="multiple_choice">Multiple</option>
                                  <option value="short_text">Short text</option>
                                  <option value="code">Code</option>
                                </select>
                                <input
                                  value={questionForm.position}
                                  onChange={(event) =>
                                    setQuestionForm((current) => ({
                                      ...current,
                                      position: event.target.value,
                                    }))
                                  }
                                  type="number"
                                  className="rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                                />
                                <input
                                  value={questionForm.points}
                                  onChange={(event) =>
                                    setQuestionForm((current) => ({
                                      ...current,
                                      points: event.target.value,
                                    }))
                                  }
                                  type="number"
                                  className="rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                                />
                              </div>
                              <textarea
                                value={questionForm.options}
                                onChange={(event) =>
                                  setQuestionForm((current) => ({
                                    ...current,
                                    options: event.target.value,
                                  }))
                                }
                                placeholder="Label|Content|true"
                                className="min-h-28 w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 font-mono text-xs outline-none"
                              />
                              <button
                                onClick={() => void handleQuestionCreate()}
                                className="w-full rounded-2xl bg-(--primary) px-4 py-3 text-sm font-semibold text-(--primary-contrast)"
                              >
                                Add question
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {lessonForm.type === "coding_lab" ? (
                      <div className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
                        <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">
                          Coding lab
                        </p>
                        <h3 className="mt-2 text-xl font-semibold">Exercise builder</h3>
                        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                          <div className="space-y-3">
                            {lessonDetail.coding_exercises.map((exercise) => (
                              <div
                                key={exercise.id}
                                className="rounded-3xl border border-(--border) bg-(--surface) p-4"
                              >
                                <p className="text-sm font-semibold">{exercise.title}</p>
                                <p className="mt-2 text-sm leading-6 text-(--text-secondary)">
                                  {exercise.prompt}
                                </p>
                                <pre className="mt-3 overflow-x-auto rounded-2xl bg-(--surface-inset) p-3 text-xs text-(--text-secondary)">
                                  {exercise.starter_code}
                                </pre>
                              </div>
                            ))}
                          </div>
                          <div className="rounded-3xl border border-(--border) bg-(--surface) p-4">
                            <p className="text-sm font-semibold">Add exercise</p>
                            <div className="mt-3 space-y-3">
                              <input
                                value={exerciseForm.title}
                                onChange={(event) =>
                                  setExerciseForm((current) => ({
                                    ...current,
                                    title: event.target.value,
                                  }))
                                }
                                placeholder="Exercise title"
                                className="w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                              />
                              <textarea
                                value={exerciseForm.prompt}
                                onChange={(event) =>
                                  setExerciseForm((current) => ({
                                    ...current,
                                    prompt: event.target.value,
                                  }))
                                }
                                placeholder="Prompt"
                                className="min-h-24 w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 text-sm outline-none"
                              />
                              <textarea
                                value={exerciseForm.starter_code}
                                onChange={(event) =>
                                  setExerciseForm((current) => ({
                                    ...current,
                                    starter_code: event.target.value,
                                  }))
                                }
                                className="min-h-32 w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 font-mono text-xs outline-none"
                              />
                              <textarea
                                value={exerciseForm.solution_code}
                                onChange={(event) =>
                                  setExerciseForm((current) => ({
                                    ...current,
                                    solution_code: event.target.value,
                                  }))
                                }
                                className="min-h-32 w-full rounded-2xl border border-(--border) bg-(--surface-inset) px-3 py-2 font-mono text-xs outline-none"
                              />
                              <button
                                onClick={() => void handleExerciseCreate()}
                                className="w-full rounded-2xl bg-(--primary) px-4 py-3 text-sm font-semibold text-(--primary-contrast)"
                              >
                                Add coding exercise
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-(--border) bg-(--surface-glass) p-5 shadow-(--shadow-md) backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-(--text-secondary)">Preview</p>
            <h2 className="mt-2 text-xl font-semibold">
              {previewMode && lessonDetail ? lessonDetail.title : "Toggle preview"}
            </h2>
            {previewMode && lessonDetail ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-3xl border border-(--border) bg-(--surface) p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--text-tertiary)">
                    /{lessonDetail.slug}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-(--text-secondary)">
                    {lessonDetail.description || "No description set for this lesson yet."}
                  </p>
                </div>
                {previewBlocks.map((block) => (
                  <PreviewBlock key={block.id} block={block} />
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-(--text-secondary)">
                Preview mode lets instructors sanity-check article flow, code snippets, resources,
                and embeds before publishing.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-medium text-(--text-secondary)">{label}</span>
      {children}
    </label>
  );
}

function PreviewBlock({ block }: { block: ContentBlock }) {
  if (block.type === "markdown") {
    return (
      <section className="rounded-3xl border border-(--border) bg-(--surface) p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-(--text-tertiary)">
          {block.title || "Markdown"}
        </p>
        <pre className="mt-3 whitespace-pre-wrap text-sm leading-7 text-(--text-secondary)">
          {String(block.content.body ?? "")}
        </pre>
      </section>
    );
  }

  if (block.type === "code") {
    return (
      <section className="rounded-3xl border border-(--border) bg-(--surface) p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-(--text-tertiary)">
          {block.title || "Code"} • {String(block.content.language ?? "text")}
        </p>
        <pre className="mt-3 overflow-x-auto rounded-2xl bg-(--surface-inset) p-3 text-xs text-(--text-primary)">
          {String(block.content.snippet ?? "")}
        </pre>
      </section>
    );
  }

  if (block.type === "embed") {
    return (
      <section className="rounded-3xl border border-(--border) bg-(--surface) p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-(--text-tertiary)">
          {block.title || "Embed"}
        </p>
        <div className="mt-3 rounded-2xl border border-dashed border-(--border-accent) bg-(--surface-inset) px-4 py-8 text-center text-sm text-(--text-secondary)">
          {String(block.content.url ?? "")}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-(--border) bg-(--surface) p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-(--text-tertiary)">
        {block.title || "Resource"}
      </p>
      <a
        href={String(block.content.url ?? "#")}
        target="_blank"
        rel="noreferrer"
        className="mt-3 block rounded-2xl bg-(--surface-inset) px-4 py-3 text-sm font-medium text-(--primary)"
      >
        {String(block.content.label ?? block.content.url ?? "Open resource")}
      </a>
    </section>
  );
}
