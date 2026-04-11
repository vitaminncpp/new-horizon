"use client";

import { useMemo, useState } from "react";
import { CourseCard } from "@/src/components/features/course-card";
import { Loader } from "@/src/components/common/loader";
import { Dropdown } from "@/src/components/common/dropdown";
import { PageWrapper } from "@/src/components/layout/page-wrapper";
import { useLearning } from "@/src/context/learning.context";
import { useAuthRedirect } from "@/src/hooks/use-auth-redirect";

const categories = ["All", "Design", "Development", "Business", "Marketing"];
const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];
const durations = ["All", "0-2 Hours", "3-6 Hours", "7+ Hours"];

export default function CoursesPage() {
  const auth = useAuthRedirect("private");
  const { courses, isLoading } = useLearning();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Popular");
  const [selectedCategories, setSelectedCategories] = useState(["Design"]);
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [duration, setDuration] = useState("3-6 Hours");
  const [page, setPage] = useState(1);

  const filteredCourses = useMemo(() => {
    const next = courses.filter((course) => {
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes("All") ||
        selectedCategories.includes(course.category);
      const difficultyMatch = difficulty === "All" || course.difficulty === difficulty;
      const durationMatch =
        duration === "All" ||
        (duration === "0-2 Hours" && course.durationHours <= 2) ||
        (duration === "3-6 Hours" && course.durationHours >= 3 && course.durationHours <= 6) ||
        (duration === "7+ Hours" && course.durationHours >= 7);
      const searchMatch = course.title.toLowerCase().includes(search.toLowerCase());

      return categoryMatch && difficultyMatch && durationMatch && searchMatch;
    });

    return sort === "Latest" ? [...next].reverse() : next;
  }, [courses, difficulty, duration, search, selectedCategories, sort]);

  const pagedCourses = filteredCourses.slice((page - 1) * 2, page * 2);

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
                onChange={() =>
                  setSelectedCategories((current) =>
                    current.includes(item)
                      ? current.filter((value) => value !== item)
                      : [...current, item],
                  )
                }
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
                Curated learning paths for the modern professional.
              </p>
            </div>
            <Dropdown label="Sort" items={["Popular", "Latest"]} value={sort} onChange={setSort} />
          </div>
          <div className="grid gap-8 xl:grid-cols-1">
            {pagedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <div className="mt-10 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPage(1)}
              className={`rounded-lg px-4 py-2 text-sm font-bold ${page === 1 ? "bg-primary text-[color:var(--color-text-on-primary)]" : "bg-surface-low text-text-secondary"}`}
            >
              1
            </button>
            <button
              type="button"
              onClick={() => setPage(2)}
              className={`rounded-lg px-4 py-2 text-sm font-bold ${page === 2 ? "bg-primary text-[color:var(--color-text-on-primary)]" : "bg-surface-low text-text-secondary"}`}
            >
              2
            </button>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
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
