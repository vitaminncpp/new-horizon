"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Loader } from "@/src/components/common/loader";
import { Modal } from "@/src/components/common/modal";
import { PageWrapper } from "@/src/components/layout/page-wrapper";
import { DashboardStats } from "@/src/components/features/dashboard-stats";
import { ProgressBar } from "@/src/components/features/progress-bar";
import { useAuth } from "@/src/context/auth.context";
import { useLearning } from "@/src/context/learning.context";
import { useAuthRedirect } from "@/src/hooks/use-auth-redirect";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const { user } = useAuth();
  const {
    progressSummary,
    featuredCourse,
    enrolledCourses,
    focusMetrics,
    upcomingItems,
    isLoading,
    error,
  } = useLearning();
  const auth = useAuthRedirect("private");

  const filteredCourses = useMemo(
    () =>
      enrolledCourses.filter((course) => course.title.toLowerCase().includes(search.toLowerCase())),
    [enrolledCourses, search],
  );
  const firstName = user?.name.split(" ")[0] ?? "there";

  if (auth.isLoading || isLoading) {
    return <Loader label="Loading dashboard" />;
  }

  if (!progressSummary) {
    return (
      <PageWrapper
        searchPlaceholder="Search courses, mentors, or resources..."
        onSearch={setSearch}
      >
        <div className="mx-auto max-w-240 p-8">
          <div className="rounded-3xl bg-surface-lowest p-8 card-shadow dark:card-shadow-dark">
            <h2 className="text-2xl font-bold text-text-primary">Dashboard unavailable</h2>
            <p className="mt-3 text-sm text-text-secondary">
              {error ?? "Learning data could not be loaded yet."}
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!featuredCourse) {
    return (
      <PageWrapper
        searchPlaceholder="Search courses, mentors, or resources..."
        onSearch={setSearch}
      >
        <div className="mx-auto max-w-240 p-8">
          <div className="rounded-3xl bg-surface-lowest p-8 card-shadow dark:card-shadow-dark">
            <h2 className="text-2xl font-bold text-text-primary">No courses available yet</h2>
            <p className="mt-3 text-sm text-text-secondary">
              {error ??
                "The course catalog is empty. Seed the database or create published courses to populate the dashboard."}
            </p>
            <Link
              href="/courses"
              className="mt-6 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-bold text-text-on-primary"
            >
              Go to Courses
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper searchPlaceholder="Search courses, mentors, or resources..." onSearch={setSearch}>
      <div className="mx-auto max-w-350 p-8">
        <div className="mb-10">
          <h2 className="mb-2 text-4xl font-extrabold tracking-tight text-text-primary">
            Welcome {firstName}!
          </h2>
          <p className="max-w-2xl text-lg text-text-secondary">
            Pick up from your current path, review upcoming lessons, and keep your weekly progress
            moving.
          </p>
        </div>
        <DashboardStats summary={progressSummary} />
        <div className="mt-10 grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-10">
            <section>
              <div className="mb-6 flex items-end justify-between">
                <h3 className="text-2xl font-bold tracking-tight text-text-primary">
                  Continue Learning
                </h3>
                <button
                  type="button"
                  onClick={() => setOpenModal(true)}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View Roadmap
                </button>
              </div>
              <div className="relative overflow-hidden rounded-3xl bg-surface-lowest p-8 card-shadow dark:card-shadow-dark">
                <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
                  <span className="material-symbols-outlined rotate-12 text-[200px] text-primary">
                    auto_awesome
                  </span>
                </div>
                <div className="relative z-10">
                  <span className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    {featuredCourse.tag}
                  </span>
                  <h4 className="mb-2 text-3xl font-bold text-text-primary">
                    {featuredCourse.title}
                  </h4>
                  <p className="mb-8 max-w-md text-text-secondary">{featuredCourse.summary}</p>
                  <div className="mb-8">
                    <div className="mb-2 flex items-end justify-between">
                      <span className="text-sm font-bold text-text-primary">Overall Progress</span>
                      <span className="text-sm font-bold text-primary">
                        {featuredCourse.progress}%
                      </span>
                    </div>
                    <ProgressBar value={featuredCourse.progress} />
                  </div>
                  <Link
                    href={`/course/${featuredCourse.id}`}
                    className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-text-on-primary shadow-[0_20px_40px_rgba(85,67,207,0.2)] transition-colors hover:bg-primary-dim"
                  >
                    Resume Lesson
                  </Link>
                </div>
              </div>
            </section>
            <section>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-bold tracking-tight text-text-primary">
                  Enrolled Paths
                </h3>
                <Link
                  href="/courses"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {filteredCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/course/${course.id}`}
                    className="rounded-3xl bg-surface-lowest p-6 transition-transform hover:-translate-y-1 card-shadow dark:card-shadow-dark"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
                      {course.category}
                    </p>
                    <h4 className="mt-3 text-xl font-bold text-text-primary">{course.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                      {course.description}
                    </p>
                    <div className="mt-5">
                      <ProgressBar value={course.progress} tone="secondary" />
                    </div>
                  </Link>
                ))}
                {filteredCourses.length === 0 ? (
                  <div className="rounded-3xl bg-surface-lowest p-6 card-shadow dark:card-shadow-dark md:col-span-2">
                    <h4 className="text-xl font-bold text-text-primary">No enrolled paths found</h4>
                    <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                      {search
                        ? "No enrolled course matches your search."
                        : "Enroll in a course to populate this section."}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
          <div className="space-y-10">
            <section className="rounded-3xl bg-surface-lowest p-8 card-shadow dark:card-shadow-dark">
              <h3 className="text-2xl font-bold tracking-tight text-text-primary">Focus Metrics</h3>
              <div className="mt-6 space-y-6">
                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm font-semibold text-text-secondary">Weekly Goal</span>
                    <span className="text-sm font-bold text-primary">
                      {focusMetrics.weeklyGoalPercent}%
                    </span>
                  </div>
                  <ProgressBar value={focusMetrics.weeklyGoalPercent} tone="secondary" />
                </div>
                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm font-semibold text-text-secondary">Assignments</span>
                    <span className="text-sm font-bold text-primary">
                      {focusMetrics.assignmentsPercent}%
                    </span>
                  </div>
                  <ProgressBar value={focusMetrics.assignmentsPercent} />
                </div>
              </div>
            </section>
            <section className="rounded-3xl bg-surface-lowest p-8 card-shadow dark:card-shadow-dark">
              <h3 className="text-2xl font-bold tracking-tight text-text-primary">Upcoming</h3>
              <div className="mt-6 space-y-4">
                {upcomingItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block rounded-xl bg-surface-low p-4 transition-colors hover:bg-surface-container"
                  >
                    <p className="text-sm font-semibold text-text-primary">{item.title}</p>
                    <p className="mt-1 text-xs text-text-secondary">{item.subtitle}</p>
                  </Link>
                ))}
                {upcomingItems.length === 0 ? (
                  <div className="rounded-xl bg-surface-low p-4">
                    <p className="text-sm font-semibold text-text-primary">No upcoming lessons</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      Enrolled course lessons will appear here.
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        </div>
      </div>
      <Modal open={openModal} title="Learning Roadmap" onClose={() => setOpenModal(false)}>
        <p className="text-sm leading-relaxed text-text-secondary">
          Your roadmap is built from enrolled course progress. Continue the next lesson, complete
          assessments, and finished paths will update these metrics automatically.
        </p>
      </Modal>
    </PageWrapper>
  );
}
