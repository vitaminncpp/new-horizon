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
    return (
      <main className="min-h-screen bg-bg text-text-primary p-12 flex flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-sm font-bold tracking-widest uppercase text-text-tertiary">
          Loading studio...
        </p>
      </main>
    );
  }

  if (!user || (user.role !== "instructor" && user.role !== "admin")) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-bg text-text-primary">
        <div className="absolute inset-0 gradient-page opacity-50" />
        <div className="relative mx-auto flex min-h-screen items-center justify-center px-6 py-12">
          <section className="w-full rounded-xl border border-border bg-surface-glass p-10 shadow-lg backdrop-blur-xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-2 w-2 rounded-full bg-danger" />
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-text-tertiary">
                Restricted Access
              </p>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Instructor studio required.</h1>
            <p className="mt-4 text-base leading-relaxed text-text-secondary">
              This environment is reserved for authorized instructors and platform administrators.
              If you believe this is an error, please contact support or switch accounts.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="/workspace"
                className="rounded-lg border border-border bg-surface px-6 py-3 text-sm font-bold transition hover:border-border-strong hover:bg-surface-soft active:scale-95"
              >
                Return to Workspace
              </a>
              <button
                onClick={() => void logout()}
                className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-contrast shadow-glow transition hover:brightness-110 active:scale-95"
              >
                Switch Account
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg text-text-primary">
      <div className="absolute inset-0 gradient-page opacity-30" />

      <div className="relative mx-auto flex min-h-screen flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-6 rounded-xl border border-border-accent bg-surface-glass p-8 shadow-lg backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">
                Instructor Studio
              </p>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Curriculum Architect</h1>
            <p className="mt-2 text-sm font-medium text-text-secondary">
              Design, sequence, and manage interactive lessons. Toggle preview mode to see exactly
              how your content appears to learners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setPreviewMode((current) => !current)}
              className={`rounded-lg border px-5 py-2.5 text-xs font-bold transition active:scale-95 ${
                previewMode
                  ? "border-primary bg-primary text-primary-contrast shadow-glow"
                  : "border-border bg-surface text-text-primary hover:border-border-strong"
              }`}
            >
              {previewMode ? "Exit Preview" : "Enter Preview"}
            </button>
            <a
              href="/workspace"
              className="rounded-lg border border-border bg-surface px-5 py-2.5 text-xs font-bold text-text-primary transition hover:border-border-strong active:scale-95"
            >
              Back to Workspace
            </a>
          </div>
        </header>

        {message ? (
          <div className="rounded-lg border border-primary/20 bg-primary-soft px-6 py-3 text-xs font-bold text-primary shadow-sm animate-in fade-in slide-in-from-top-2">
            {message}
          </div>
        ) : null}

        <div className="grid flex-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)_400px]">
          {/* Catalog Sidebar */}
          <aside className="flex flex-col gap-6 rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl overflow-hidden">
            <div className="border-b border-border pb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                Global Catalog
              </p>
              <h2 className="mt-1 text-xl font-bold">Managed Courses</h2>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`group w-full rounded-lg border p-4 text-left transition active:scale-[0.98] ${
                    selectedCourseId === course.id
                      ? "border-primary bg-primary-soft shadow-sm"
                      : "border-border bg-surface hover:border-border-strong"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p
                      className={`text-sm font-bold group-hover:text-primary transition-colors ${selectedCourseId === course.id ? "text-primary" : "text-text-primary"}`}
                    >
                      {course.title}
                    </p>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border ${
                        course.status === "published"
                          ? "border-success/30 bg-success-bg text-success"
                          : "border-border bg-surface-inset text-text-tertiary"
                      }`}
                    >
                      {course.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-medium text-text-secondary line-clamp-2">
                    {course.summary || "No course summary defined."}
                  </p>
                </button>
              ))}
            </div>

            <form
              onSubmit={handleCourseCreate}
              className="mt-4 space-y-3 rounded-lg border border-border bg-surface-inset p-5 shadow-inner"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-text-tertiary">
                Add New Path
              </p>
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
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium outline-none focus:border-primary transition"
              />
              <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-contrast shadow-glow transition hover:brightness-110 active:scale-95">
                Initialize Course
              </button>
            </form>
          </aside>

          {/* Main Editor */}
          <section className="flex flex-col gap-6 overflow-hidden">
            {/* Course Settings */}
            <div className="rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                    Course Management
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    {courseDetail?.title || "Identify a Target Course"}
                  </h2>
                </div>
                {courseDetail ? (
                  <button
                    onClick={() => void handleCourseUpdate()}
                    className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-contrast shadow-glow transition hover:brightness-110 active:scale-95"
                  >
                    Save Changes
                  </button>
                ) : null}
              </div>

              {courseDetail ? (
                <div className="grid gap-5 lg:grid-cols-2">
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
                      className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium outline-none focus:border-primary transition shadow-sm"
                    />
                  </Field>
                  <Field label="Identifier (Slug)">
                    <input
                      value={courseForm.slug}
                      onChange={(event) =>
                        setCourseForm((current) => ({
                          ...current,
                          slug: slugify(event.target.value),
                        }))
                      }
                      className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-mono outline-none focus:border-primary transition shadow-sm"
                    />
                  </Field>
                  <Field label="Brief Summary" className="lg:col-span-2">
                    <textarea
                      value={courseForm.summary}
                      onChange={(event) =>
                        setCourseForm((current) => ({ ...current, summary: event.target.value }))
                      }
                      className="min-h-20 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium outline-none focus:border-primary transition shadow-sm"
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-5 lg:col-span-2">
                    <Field label="Target Status">
                      <select
                        value={courseForm.status}
                        onChange={(event) =>
                          setCourseForm((current) => ({
                            ...current,
                            status: event.target.value as CourseSummary["status"],
                          }))
                        }
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-bold outline-none focus:border-primary transition shadow-sm"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </Field>
                    <Field label="Expertise Level">
                      <select
                        value={courseForm.level}
                        onChange={(event) =>
                          setCourseForm((current) => ({
                            ...current,
                            level: event.target.value as CourseSummary["level"],
                          }))
                        }
                        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-bold outline-none focus:border-primary transition shadow-sm"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </Field>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center rounded-lg border border-dashed border-border bg-surface-inset">
                  <p className="text-sm font-bold text-text-tertiary uppercase tracking-widest">
                    Select a path from the left to configure metadata.
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,1.5fr)]">
              {/* Structure Panel */}
              <div className="rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl overflow-y-auto custom-scrollbar">
                <div className="border-b border-border pb-4 mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                    Curriculum Flow
                  </p>
                  <h3 className="mt-1 text-xl font-bold">Structure Map</h3>
                </div>

                <div className="space-y-6">
                  {courseDetail?.sections.map((section) => (
                    <div
                      key={section.id}
                      className="rounded-lg border border-border bg-surface p-5 shadow-sm"
                    >
                      <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                        <p className="text-sm font-black text-primary tracking-widest uppercase">
                          {section.position}. {section.title}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {section.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => {
                              setSelectedLessonId(lesson.id);
                              setSelectedAssessmentId(null);
                            }}
                            className={`w-full rounded-md border p-3 text-left transition active:scale-[0.98] ${
                              selectedLessonId === lesson.id
                                ? "border-primary bg-primary-soft shadow-sm"
                                : "border-border bg-surface-inset hover:border-border-strong"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p
                                className={`text-sm font-bold ${selectedLessonId === lesson.id ? "text-primary" : "text-text-primary"}`}
                              >
                                {lesson.position}. {lesson.title}
                              </p>
                              <span className="rounded bg-surface px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest border border-border">
                                {lesson.type}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => void handleLessonCreate(section.id)}
                        className="mt-4 w-full rounded-md border border-dashed border-primary/30 bg-primary-soft/30 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary-soft transition"
                      >
                        Append Unit
                      </button>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleSectionCreate}
                  className="mt-8 space-y-4 rounded-lg border border-border bg-surface-inset p-5 shadow-inner"
                >
                  <p className="text-xs font-black uppercase tracking-widest text-text-tertiary">
                    New Section
                  </p>
                  <input
                    value={sectionForm.title}
                    onChange={(event) =>
                      setSectionForm((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="Section Name"
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-sm font-bold outline-none focus:border-primary transition"
                  />
                  <button className="w-full rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-primary-contrast shadow-glow transition hover:brightness-110 active:scale-95">
                    Create Section
                  </button>
                </form>
              </div>

              {/* Lesson Editor */}
              <div className="space-y-6 overflow-y-auto custom-scrollbar">
                <div className="rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                        Unit Editor
                      </p>
                      <h3 className="mt-1 text-2xl font-black">
                        {lessonDetail ? lessonDetail.title : "Initialize a Unit"}
                      </h3>
                    </div>
                    {lessonDetail ? (
                      <button
                        onClick={() => void handleLessonUpdate()}
                        className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-contrast shadow-glow transition hover:brightness-110 active:scale-95"
                      >
                        Commit Changes
                      </button>
                    ) : null}
                  </div>

                  {lessonDetail ? (
                    <div className="grid gap-5">
                      <div className="grid gap-5 lg:grid-cols-2">
                        <Field label="Unit Title">
                          <input
                            value={lessonForm.title}
                            onChange={(event) =>
                              setLessonForm((current) => ({
                                ...current,
                                title: event.target.value,
                                slug: slugify(event.target.value),
                              }))
                            }
                            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium outline-none focus:border-primary transition shadow-sm"
                          />
                        </Field>
                        <Field label="Unit Type">
                          <select
                            value={lessonForm.type}
                            onChange={(event) =>
                              setLessonForm((current) => ({
                                ...current,
                                type: event.target.value as LessonDetail["type"],
                              }))
                            }
                            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-bold outline-none focus:border-primary transition shadow-sm"
                          >
                            <option value="article">Article</option>
                            <option value="video">Video</option>
                            <option value="live_session">Live session</option>
                            <option value="quiz">Quiz</option>
                            <option value="coding_lab">Coding lab</option>
                          </select>
                        </Field>
                      </div>
                      <Field label="Pedagogical Intent">
                        <textarea
                          value={lessonForm.description}
                          onChange={(event) =>
                            setLessonForm((current) => ({
                              ...current,
                              description: event.target.value,
                            }))
                          }
                          className="min-h-24 w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium outline-none focus:border-primary transition shadow-sm"
                        />
                      </Field>
                      <div className="flex flex-wrap gap-5">
                        <Field label="Position" className="w-24">
                          <input
                            type="number"
                            value={lessonForm.position}
                            onChange={(event) =>
                              setLessonForm((current) => ({
                                ...current,
                                position: event.target.value,
                              }))
                            }
                            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-bold text-center outline-none focus:border-primary transition shadow-sm"
                          />
                        </Field>
                        <Field label="Minutes" className="w-24">
                          <input
                            type="number"
                            value={lessonForm.estimated_minutes}
                            onChange={(event) =>
                              setLessonForm((current) => ({
                                ...current,
                                estimated_minutes: event.target.value,
                              }))
                            }
                            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-bold text-center outline-none focus:border-primary transition shadow-sm"
                          />
                        </Field>
                        <label className="mt-7 flex items-center gap-3 rounded-lg border border-border bg-surface px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition hover:bg-surface-soft cursor-pointer shadow-sm">
                          <input
                            type="checkbox"
                            checked={lessonForm.is_preview}
                            onChange={(event) =>
                              setLessonForm((current) => ({
                                ...current,
                                is_preview: event.target.checked,
                              }))
                            }
                            className="h-4 w-4 rounded accent-primary"
                          />
                          <span>Public Preview</span>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center rounded-lg border border-dashed border-border bg-surface-inset">
                      <p className="text-sm font-bold text-text-tertiary uppercase tracking-widest">
                        Choose a unit from the structure map to begin authoring.
                      </p>
                    </div>
                  )}
                </div>

                {lessonDetail ? (
                  <div className="rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl">
                    <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                          Content Pipeline
                        </p>
                        <h3 className="mt-1 text-xl font-bold">Content Blocks</h3>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        {lessonDetail.content_blocks.map((block) => (
                          <div
                            key={block.id}
                            className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition-all hover:border-border-strong"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <p className="text-sm font-bold">
                                  {block.position}. {block.title || block.type}
                                </p>
                                <span className="rounded bg-surface-inset px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest border border-border text-text-tertiary">
                                  {block.type}
                                </span>
                              </div>
                              <button
                                onClick={() => void handleBlockDelete(block.id)}
                                className="text-[10px] font-black uppercase tracking-widest text-danger hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg border border-border bg-surface-inset p-5 shadow-inner">
                        <p className="text-xs font-black uppercase tracking-widest text-text-tertiary mb-4">
                          Append Component
                        </p>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Field label="Type">
                              <select
                                value={blockForm.type}
                                onChange={(event) => {
                                  const nextType = event.target.value as ContentBlock["type"];
                                  setBlockForm((current) => ({
                                    ...current,
                                    type: nextType,
                                    content: JSON.stringify(
                                      contentBlockTemplates[nextType],
                                      null,
                                      2,
                                    ),
                                  }));
                                }}
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs font-bold outline-none focus:border-primary transition"
                              >
                                <option value="markdown">Markdown</option>
                                <option value="code">Code</option>
                                <option value="embed">Embed</option>
                                <option value="resource">Resource</option>
                              </select>
                            </Field>
                            <Field label="Order">
                              <input
                                value={blockForm.position}
                                onChange={(event) =>
                                  setBlockForm((current) => ({
                                    ...current,
                                    position: event.target.value,
                                  }))
                                }
                                type="number"
                                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs font-bold text-center outline-none focus:border-primary transition"
                              />
                            </Field>
                          </div>
                          <Field label="Title">
                            <input
                              value={blockForm.title}
                              onChange={(event) =>
                                setBlockForm((current) => ({
                                  ...current,
                                  title: event.target.value,
                                }))
                              }
                              placeholder="Component Heading"
                              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs font-bold outline-none focus:border-primary transition"
                            />
                          </Field>
                          <Field label="Payload (JSON)">
                            <textarea
                              value={blockForm.content}
                              onChange={(event) =>
                                setBlockForm((current) => ({
                                  ...current,
                                  content: event.target.value,
                                }))
                              }
                              className="min-h-48 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-[10px] outline-none focus:border-primary transition shadow-inner"
                            />
                          </Field>
                          <button
                            onClick={() => void handleBlockCreate()}
                            className="w-full rounded-lg bg-secondary px-4 py-3 text-xs font-black uppercase tracking-widest text-secondary-contrast shadow-md transition hover:brightness-110 active:scale-95"
                          >
                            Integrate Component
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {/* Contextual Preview */}
          <aside className="rounded-xl border border-border bg-surface-glass p-6 shadow-md backdrop-blur-xl flex flex-col overflow-hidden">
            <div className="border-b border-border pb-4 mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                Real-time Feedback
              </p>
              <h2 className="mt-1 text-xl font-bold">
                {previewMode && lessonDetail ? "Live Lens" : "Architectural View"}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              {previewMode && lessonDetail ? (
                <>
                  <div className="rounded-lg border border-border bg-surface-inset p-5 shadow-inner">
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary mb-2">
                      /{lessonDetail.slug}
                    </p>
                    <p className="text-sm font-medium leading-relaxed text-text-secondary">
                      {lessonDetail.description ||
                        "The pedagogical intent for this unit has not been established yet."}
                    </p>
                  </div>
                  {previewBlocks.map((block) => (
                    <PreviewBlock key={block.id} block={block} />
                  ))}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-lg bg-surface-inset">
                  <div className="h-12 w-12 rounded-full bg-surface border border-border flex items-center justify-center mb-4 text-text-tertiary">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-text-tertiary uppercase tracking-widest">
                    Live Preview Hidden
                  </p>
                  <p className="mt-2 text-xs text-text-tertiary leading-relaxed">
                    Toggle the Lens above to visualize how components will render in the learner
                    environment.
                  </p>
                </div>
              )}
            </div>
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
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-text-tertiary">
        {label}
      </span>
      {children}
    </label>
  );
}

function PreviewBlock({ block }: { block: ContentBlock }) {
  const containerClasses = "rounded-lg border border-border bg-surface p-5 shadow-sm";
  const labelClasses = "text-[9px] font-black uppercase tracking-widest text-text-tertiary mb-3";

  if (block.type === "markdown") {
    return (
      <section className={containerClasses}>
        <p className={labelClasses}>{block.title || "Markdown Component"}</p>
        <div className="prose prose-sm text-text-secondary leading-relaxed font-sans whitespace-pre-wrap">
          {String(block.content.body ?? "")}
        </div>
      </section>
    );
  }

  if (block.type === "code") {
    return (
      <section className={containerClasses}>
        <div className="flex items-center justify-between mb-3">
          <p className={labelClasses.replace("mb-3", "")}>{block.title || "Code Snippet"}</p>
          <span className="rounded bg-surface-inset px-1.5 py-0.5 text-[8px] font-black border border-border text-text-tertiary">
            {String(block.content.language ?? "text")}
          </span>
        </div>
        <pre className="overflow-x-auto rounded-md bg-surface-inset p-4 text-[11px] font-mono text-text-primary shadow-inner border border-border">
          <code>{String(block.content.snippet ?? "")}</code>
        </pre>
      </section>
    );
  }

  if (block.type === "embed") {
    return (
      <section className={containerClasses}>
        <p className={labelClasses}>{block.title || "External Resource"}</p>
        <div className="rounded-md border border-dashed border-primary/40 bg-primary-soft/30 px-4 py-12 text-center shadow-inner">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">
            Content Frame
          </p>
          <p className="mt-1 text-[10px] text-primary truncate opacity-60">
            {String(block.content.url ?? "")}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={containerClasses}>
      <p className={labelClasses}>{block.title || "Asset Link"}</p>
      <a
        href={String(block.content.url ?? "#")}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between rounded-md bg-primary-soft px-4 py-3 text-xs font-bold text-primary transition hover:bg-primary/20 border border-primary-border"
      >
        <span>{String(block.content.label ?? block.content.url ?? "Launch Resource")}</span>
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
