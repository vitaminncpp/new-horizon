/* eslint-disable @next/next/no-img-element */

"use client";

import { PageWrapper } from "@/src/components/layout/page-wrapper";
import { Loader } from "@/src/components/common/loader";
import { Tabs } from "@/src/components/common/tabs";
import { useAuth } from "@/src/context/auth.context";
import { useLearning } from "@/src/context/learning.context";
import { useAuthRedirect } from "@/src/hooks/use-auth-redirect";
import { useState } from "react";

export default function ProfilePage() {
  const auth = useAuthRedirect("private");
  const { user } = useAuth();
  const { courses, isLoading } = useLearning();
  const [tab, setTab] = useState("overview");

  if (auth.isLoading || isLoading || !user) {
    return <Loader label="Loading profile" />;
  }

  return (
    <PageWrapper searchPlaceholder="Search your profile...">
      <div className="mx-auto max-w-6xl p-8">
        <section className="rounded-[1.5rem] bg-surface-lowest p-8 card-shadow dark:card-shadow-dark">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <img alt={user.name} src={user.avatar} className="h-24 w-24 rounded-2xl object-cover" />
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Academic Curator
              </p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-text-primary">
                {user.name}
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                {user.major} • {user.plan}
              </p>
            </div>
          </div>
        </section>
        <div className="mt-8">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { value: "overview", label: "Overview" },
              { value: "progress", label: "Progress" },
              { value: "saved", label: "Saved" },
            ]}
          />
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {(tab === "overview"
            ? courses.slice(0, 2)
            : courses.filter((course) => course.enrolled)
          ).map((course) => (
            <div
              key={course.id}
              className="rounded-[1.5rem] bg-surface-lowest p-6 card-shadow dark:card-shadow-dark"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-secondary">
                {course.category}
              </p>
              <h3 className="mt-3 text-xl font-bold text-text-primary">{course.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{course.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
