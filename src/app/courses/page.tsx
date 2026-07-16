"use client";

import { useEffect, useMemo, useState } from "react";
import { CourseCard } from "@/src/components/features/course-card";
import { Loader } from "@/src/components/common/loader";
import { Dropdown } from "@/src/components/common/dropdown";
import { PageWrapper } from "@/src/components/layout/page-wrapper";
import { useAuthRedirect } from "@/src/hooks/use-auth-redirect";
import * as courseService from "@/src/services/api/course.service";
import type { Course } from "@/src/services/mock/types";

const categories = ["All", "Design", "Development", "Business", "Marketing"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
const durations = ["All", "0-2 Hours", "3-6 Hours", "7+ Hours"];
const pageSize = 6;

const durationValues: Record<string, string | undefined> = {
  All: undefined,
  "0-2 Hours": "0-2",
  "3-6 Hours": "3-6",
  "7+ Hours": "7-plus",
};

const sortValues: Record<string, string> = {
  Popular: "popular",
  Latest: "latest",
  Rating: "rating",
};

export default function CoursesPage() {
  const auth = useAuthRedirect("private");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Popular");
  const [selectedCategories, setSelectedCategories] = useState(["All"]);
  const [difficulty, setDifficulty] = useState("All");
  const [duration, setDuration] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const visiblePages = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  useEffect(() => {
    if (auth.isLoading) {
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    void courseService
      .listCoursesPage({
        search,
        categories: selectedCategories,
        difficulty,
        duration: durationValues[duration],
        sort: sortValues[sort],
        page,
        pageSize,
      })
      .then((response) => {
        if (!active) {
          return;
        }

        setCourses(response.items);
        setTotalPages(response.meta?.totalPages ?? 1);
        setTotalItems(response.meta?.totalItems ?? response.items.length);
        if (response.meta?.page && response.meta.page !== page) {
          setPage(response.meta.page);
        }
      })
      .catch((cause) => {
        if (!active) {
          return;
        }

        setCourses([]);
        setTotalPages(1);
        setTotalItems(0);
        setError(cause instanceof Error ? cause.message : "Unable to load courses.");
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [auth.isLoading, difficulty, duration, page, search, selectedCategories, sort]);

  useEffect(() => {
    setPage(1);
  }, [difficulty, duration, search, selectedCategories, sort]);

  if (auth.isLoading || isLoading) {
    return <Loader label="Loading courses" />;
  }

  return (
    <PageWrapper searchPlaceholder="Search for courses, topics, or mentors..." onSearch={setSearch}>
      <div className="flex flex-col lg:flex-row">
        <aside className="hidden w-72 shrink-0 border-r border-border-soft bg-surface p-8 lg:block">
          <FilterGroup title="Category">
            {categories.map((item) => (
              <Checkbox
                key={item}
                checked={selectedCategories.includes(item)}
                label={item}
                onChange={() => setSelectedCategories((current) => toggleCategory(current, item))}
              />
            ))}
          </FilterGroup>
          <FilterGroup title="Difficulty">
            {difficulties.map((item) => (
              <Radio
                key={item}
                checked={difficulty === item}
                label={item}
                onChange={() => setDifficulty(item)}
              />
            ))}
          </FilterGroup>
          <FilterGroup title="Duration">
            {durations.map((item) => (
              <Checkbox
                key={item}
                checked={duration === item}
                label={item}
                onChange={() => setDuration(item)}
              />
            ))}
          </FilterGroup>
        </aside>
        <section className="flex-1 p-8">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mb-2 text-4xl font-extrabold tracking-tight text-text-primary">
                Explore Courses
              </h2>
              <p className="font-medium text-text-secondary">
                {totalItems} curated learning {totalItems === 1 ? "path" : "paths"} available.
              </p>
            </div>
            <Dropdown
              label="Sort"
              items={["Popular", "Latest", "Rating"]}
              value={sort}
              onChange={setSort}
            />
          </div>
          <div className="grid gap-8 xl:grid-cols-1">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
            {courses.length === 0 ? (
              <div className="rounded-[1.5rem] bg-surface-lowest p-8 card-shadow dark:card-shadow-dark">
                <h3 className="text-xl font-bold text-text-primary">No courses found</h3>
                <p className="mt-3 text-sm text-text-secondary">
                  {error ?? "Adjust your filters or search query to see more courses."}
                </p>
              </div>
            ) : null}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg bg-surface-low px-4 py-2 text-sm font-bold text-text-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            {visiblePages.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={`rounded-lg px-4 py-2 text-sm font-bold ${page === item ? "bg-primary text-[color:var(--color-text-on-primary)]" : "bg-surface-low text-text-secondary"}`}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
              className="rounded-lg bg-surface-low px-4 py-2 text-sm font-bold text-text-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}

function toggleCategory(current: string[], item: string) {
  if (item === "All") {
    return ["All"];
  }

  const withoutAll = current.filter((value) => value !== "All");
  const next = withoutAll.includes(item)
    ? withoutAll.filter((value) => value !== item)
    : [...withoutAll, item];

  return next.length > 0 ? next : ["All"];
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.05em] text-text-secondary">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Checkbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        checked={checked}
        onChange={onChange}
        type="checkbox"
        className="h-4 w-4 rounded text-primary"
      />
      <span className="text-sm font-medium text-text-primary">{label}</span>
    </label>
  );
}

function Radio({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <input
        checked={checked}
        onChange={onChange}
        type="radio"
        name="difficulty"
        className="h-4 w-4 text-primary"
      />
      <span className="text-sm font-medium text-text-primary">{label}</span>
    </label>
  );
}
