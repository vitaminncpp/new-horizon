/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { Course } from "@/src/services/mock/types";
import { Icon } from "@/src/components/common/icon";

export function CourseCard({ course }: { course: Course }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[1.5rem] bg-surface-lowest transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:flex-row">
      <div
        className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${course.accent} opacity-0 transition-opacity group-hover:opacity-100`}
      />
      <div className="relative h-56 md:h-auto md:w-1/3">
        <img alt={course.title} src={course.thumbnail} className="h-full w-full object-cover" />
        <div className="absolute left-4 top-4 rounded bg-surface-lowest/90 px-2 py-1 text-[10px] font-bold text-primary backdrop-blur">
          {course.badge}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-8">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-text-primary transition-colors group-hover:text-primary">
            {course.title}
          </h3>
          <span className="text-xs font-semibold text-text-secondary">{course.rating}</span>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">{course.summary}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-medium text-text-secondary">
          <span className="flex items-center gap-1">
            <Icon name="schedule" className="text-sm text-primary" />
            {course.durationHours}h
          </span>
          <span className="flex items-center gap-1">
            <Icon name="menu_book" className="text-sm text-primary" />
            {course.modules} modules
          </span>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-border-soft pt-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
              Instructor
            </p>
            <p className="mt-1 text-sm font-semibold text-text-primary">{course.instructor}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/courses/${course.id}`}
              className="rounded-lg bg-surface-high px-4 py-2 text-xs font-bold text-text-primary transition-colors hover:bg-surface-container"
            >
              Details
            </Link>
            <Link
              href={`/course/${course.id}`}
              className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-[color:var(--color-text-on-primary)] transition-colors hover:bg-primary-dim"
            >
              Open
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
