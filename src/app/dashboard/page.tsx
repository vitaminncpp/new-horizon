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
  const { courses, progressSummary, isLoading } = useLearning();
  const auth = useAuthRedirect("private");

  const featuredCourse = useMemo(
    () => courses.find((course) => course.featured) ?? courses[0],
    [courses],
  );

  const filteredCourses = useMemo(
    () => courses.filter((course) => course.title.toLowerCase().includes(search.toLowerCase())),
    [courses, search],
  );

  if (auth.isLoading || isLoading || !progressSummary || !featuredCourse) {
    return <Loader label="Loading dashboard" />;
  }

  return (
    <PageWrapper searchPlaceholder="Search courses, mentors, or resources..." onSearch={setSearch}>
      <div className="mx-auto max-w-[1400px] p-8">
        <div className="mb-10">
          <h2 className="mb-2 text-4xl font-extrabold tracking-tight text-text-primary">
            Welcome {user?.name.split(" ")[0]}!
          </h2>
          <p className="max-w-2xl text-lg text-text-secondary">
            Your progress this week has been exceptional. You&apos;re in the top 5% of design
            students this month.
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
              <div className="relative overflow-hidden rounded-[1.5rem] bg-surface-lowest p-8 card-shadow dark:card-shadow-dark">
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
                    className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-[color:var(--color-text-on-primary)] shadow-[0_20px_40px_rgba(85,67,207,0.2)] transition-colors hover:bg-primary-dim"
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
                {filteredCourses
                  .filter((course) => course.enrolled)
                  .map((course) => (
                    <div
                      key={course.id}
                      className="rounded-[1.5rem] bg-surface-lowest p-6 card-shadow dark:card-shadow-dark"
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
                    </div>
                  ))}
              </div>
            </section>
          </div>
          <div className="space-y-10">
            <section className="rounded-[1.5rem] bg-surface-lowest p-8 card-shadow dark:card-shadow-dark">
              <h3 className="text-2xl font-bold tracking-tight text-text-primary">Focus Metrics</h3>
              <div className="mt-6 space-y-6">
                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm font-semibold text-text-secondary">Weekly Goal</span>
                    <span className="text-sm font-bold text-primary">80%</span>
                  </div>
                  <ProgressBar value={80} tone="secondary" />
                </div>
                <div>
                  <div className="mb-2 flex justify-between">
                    <span className="text-sm font-semibold text-text-secondary">Assignments</span>
                    <span className="text-sm font-bold text-primary">60%</span>
                  </div>
                  <ProgressBar value={60} />
                </div>
              </div>
            </section>
            <section className="rounded-[1.5rem] bg-surface-lowest p-8 card-shadow dark:card-shadow-dark">
              <h3 className="text-2xl font-bold tracking-tight text-text-primary">Upcoming</h3>
              <div className="mt-6 space-y-4">
                {["Gestalt Theory Review", "Interactive Quiz Panel", "Portfolio Critique"].map(
                  (item) => (
                    <div key={item} className="rounded-xl bg-surface-low p-4">
                      <p className="text-sm font-semibold text-text-primary">{item}</p>
                      <p className="mt-1 text-xs text-text-secondary">Due in 2 days</p>
                    </div>
                  ),
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
      <Modal open={openModal} title="Learning Roadmap" onClose={() => setOpenModal(false)}>
        <p className="text-sm leading-relaxed text-text-secondary">
          Tonal depth, editorial typography, glass interfaces, and structured critique remain your
          next roadmap milestones.
        </p>
      </Modal>
    </PageWrapper>
  );
}
