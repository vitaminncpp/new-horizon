/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader } from "@/src/components/common/loader";
import { PageWrapper } from "@/src/components/layout/page-wrapper";
import { ProgressBar } from "@/src/components/features/progress-bar";
import { useLearning } from "@/src/context/learning.context";
import { useAuthRedirect } from "@/src/hooks/use-auth-redirect";
import type { Course } from "@/src/services/mock/types";

export default function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const auth = useAuthRedirect("private");
  const { getCourse } = useLearning();
  const [course, setCourse] = useState<Course | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void getCourse(id)
      .then(setCourse)
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Unable to load course."),
      );
  }, [getCourse, id]);

  if (auth.isLoading || (!course && !error)) {
    return <Loader label="Loading course" />;
  }

  if (!course) {
    return <div className="p-8 text-sm text-error">{error}</div>;
  }

  return (
    <PageWrapper searchPlaceholder="Search courses, mentors, materials...">
      <div className="mx-auto max-w-7xl p-12">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="flex-1 space-y-12">
            <section className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                  {course.difficulty} Level
                </span>
                <div className="flex items-center gap-1 text-tertiary">
                  <span className="material-symbols-outlined text-sm">star</span>
                  <span className="text-sm font-bold">{course.rating}</span>
                  <span className="ml-1 text-xs font-medium text-text-secondary">
                    ({course.reviews} reviews)
                  </span>
                </div>
              </div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-text-primary md:text-5xl">
                {course.title}:<br />
                <span className="text-primary italic">{course.tag}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-text-secondary">
                <span className="flex items-center gap-2 text-sm font-medium">
                  {course.hoursLabel}
                </span>
                <span className="flex items-center gap-2 text-sm font-medium">
                  {course.modules} Modules
                </span>
                <span className="flex items-center gap-2 text-sm font-medium">
                  {course.language}
                </span>
              </div>
            </section>
            <section className="flex items-center gap-6 rounded-xl border border-border-soft bg-surface-lowest p-8">
              <img
                alt={course.instructor}
                src={course.thumbnail}
                className="h-20 w-20 rounded-2xl object-cover"
              />
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-primary-dim">
                  Your Instructor
                </p>
                <h3 className="text-xl font-bold text-text-primary">{course.instructor}</h3>
                <p className="mt-1 text-sm text-text-secondary">{course.instructorTitle}</p>
              </div>
            </section>
            <section>
              <h2 className="mb-8 text-2xl font-bold text-text-primary">What you&apos;ll master</h2>
              <div className="grid gap-6 md:grid-cols-2">
                {[
                  [
                    "architecture",
                    "Tonal Depth Theory",
                    "Learn to create spatial hierarchy using background shifts instead of borders.",
                  ],
                  [
                    "font_download",
                    "Editorial Typography",
                    "Harness Swiss-style type contrasts to guide the learner journey.",
                  ],
                  [
                    "blur_on",
                    "Glassmorphism Flow",
                    "Use controlled blur and surface opacity to organize interface layers.",
                  ],
                  [
                    "insights",
                    "Academic Annotations",
                    "Design specialized insight systems for critique and feedback loops.",
                  ],
                ].map(([icon, title, copy], index) => (
                  <div key={title} className="rounded-xl bg-surface-lowest p-8 shadow-sm">
                    <span
                      className={`material-symbols-outlined mb-4 text-4xl ${index === 0 ? "text-primary-dim" : index === 1 ? "text-secondary" : index === 2 ? "text-tertiary" : "text-error"}`}
                    >
                      {icon}
                    </span>
                    <h4 className="mb-2 text-lg font-bold text-text-primary">{title}</h4>
                    <p className="text-sm leading-relaxed text-text-secondary">{copy}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <aside className="w-full max-w-sm space-y-6">
            <div className="overflow-hidden rounded-[1.5rem] bg-surface-lowest card-shadow dark:card-shadow-dark">
              <img alt={course.title} src={course.heroImage} className="h-56 w-full object-cover" />
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-text-secondary">Progress</span>
                  <span className="text-sm font-bold text-primary">{course.progress}%</span>
                </div>
                <ProgressBar value={course.progress} />
                <div className="mt-6 space-y-3 text-sm text-text-secondary">
                  <p>{course.lessons} lessons</p>
                  <p>{course.category}</p>
                  <p>{course.durationHours} hours</p>
                </div>
                <div className="mt-6 flex gap-3">
                  <Link
                    href={`/course/${course.id}`}
                    className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-[color:var(--color-text-on-primary)]"
                  >
                    Resume Lesson
                  </Link>
                  <Link
                    href="/courses"
                    className="rounded-xl bg-surface-low px-6 py-3 text-sm font-bold text-text-primary"
                  >
                    Back
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PageWrapper>
  );
}
