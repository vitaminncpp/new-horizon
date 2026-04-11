/* eslint-disable @next/next/no-img-element */

"use client";

import { useState } from "react";
import type { Course, CourseLessons } from "@/src/services/mock/types";
import { Icon } from "@/src/components/common/icon";
import { ProgressBar } from "@/src/components/features/progress-bar";
import { cn } from "@/src/utils/cn";

export function LessonPlayer({ course, lessons }: { course: Course; lessons: CourseLessons }) {
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "quiz">("overview");
  const [currentLessonId, setCurrentLessonId] = useState(
    lessons.modules.flatMap((module) => module.items).find((item) => item.status === "current")
      ?.id ?? lessons.modules[0]?.items[0]?.id,
  );

  const currentLesson =
    lessons.modules.flatMap((module) => module.items).find((item) => item.id === currentLessonId) ??
    lessons.modules[0].items[0];

  return (
    <div className="flex h-[calc(100vh-72px)] flex-col overflow-hidden lg:flex-row">
      <section className="hidden w-80 flex-col overflow-hidden border-r border-border-soft bg-surface-low lg:flex">
        <div className="border-b border-border-soft bg-surface-lowest/60 p-6 backdrop-blur">
          <h2 className="mb-1 text-sm font-bold text-text-primary">Course Content</h2>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <ProgressBar value={course.progress} tone="secondary" />
            </div>
            <span className="text-[10px] font-bold text-text-secondary">{course.progress}%</span>
          </div>
        </div>
        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4">
          {lessons.modules.map((module, moduleIndex) => (
            <div key={module.id}>
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-secondary">
                  Module {String(moduleIndex + 1).padStart(2, "0")}: {module.title}
                </span>
                <span className="text-[10px] font-medium text-text-secondary">
                  {module.completed}/{module.total}
                </span>
              </div>
              <div className="space-y-1">
                {module.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentLessonId(item.id)}
                    className={cn(
                      "w-full rounded-xl p-3 text-left transition-colors",
                      item.id === currentLesson.id
                        ? "border border-primary/20 bg-primary/5"
                        : "hover:bg-surface-lowest",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 text-sm",
                          item.status === "complete" && "text-secondary",
                          item.status === "current" && "text-primary",
                          item.status === "locked" && "text-text-muted",
                        )}
                      >
                        <Icon
                          name={
                            item.status === "complete"
                              ? "check_circle"
                              : item.status === "current"
                                ? "play_circle"
                                : "lock"
                          }
                          filled={item.status !== "locked"}
                        />
                      </span>
                      <div className="flex-1">
                        <p
                          className={cn(
                            "text-xs leading-snug",
                            item.id === currentLesson.id
                              ? "font-bold text-primary"
                              : "font-medium text-text-primary",
                          )}
                        >
                          {item.title}
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-[10px] text-text-secondary">
                          <Icon name="schedule" className="text-[12px]" />
                          {item.duration}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="custom-scrollbar flex-1 overflow-y-auto bg-surface-lowest">
        <div className="relative aspect-video overflow-hidden bg-black">
          <img
            alt={course.title}
            src={course.heroImage}
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              aria-label="Play lesson"
              className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 text-[color:var(--color-text-on-primary)] shadow-2xl transition-transform hover:scale-105"
            >
              <Icon name="play_arrow" filled className="ml-1 text-5xl" />
            </button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
            <div className="flex items-center gap-4">
              <Icon name="play_arrow" />
              <Icon name="volume_up" />
              <span className="text-xs font-medium">12:45 / 24:00</span>
            </div>
            <div className="flex items-center gap-4">
              <Icon name="settings" />
              <Icon name="fullscreen" />
            </div>
          </div>
        </div>
        <div className="space-y-8 p-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-secondary">
              {course.tag}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-text-primary">
              {currentLesson.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">
              {course.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {(["overview", "notes", "quiz"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "rounded-xl px-5 py-2.5 text-sm font-bold capitalize transition-colors",
                  activeTab === tab
                    ? "bg-primary text-[color:var(--color-text-on-primary)]"
                    : "bg-surface-low text-text-secondary hover:text-text-primary",
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          {activeTab === "overview" ? (
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className="rounded-[1.5rem] bg-surface p-8">
                <h2 className="text-xl font-bold text-text-primary">Lesson Overview</h2>
                <p className="mt-4 text-sm leading-relaxed text-text-secondary">
                  Learn how tonal hierarchy, deliberate typography, and progression cues shape a
                  coherent interactive learning experience. This session mirrors the source player
                  skeleton and prepares the next locked module.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-surface p-8">
                <h2 className="text-xl font-bold text-text-primary">Checklist</h2>
                <ul className="mt-4 space-y-3 text-sm text-text-secondary">
                  <li>Review the lesson goals</li>
                  <li>Take guided notes</li>
                  <li>Complete the quiz panel</li>
                </ul>
              </div>
            </div>
          ) : null}
          {activeTab === "notes" ? (
            <div className="rounded-[1.5rem] bg-surface p-8">
              <h2 className="text-xl font-bold text-text-primary">Notes</h2>
              <textarea
                aria-label="Lesson notes"
                className="mt-4 min-h-56 w-full rounded-xl border border-border-soft bg-surface-low p-4 text-sm text-text-primary focus:ring-2 focus:ring-primary/40"
                placeholder="Capture key takeaways from this lesson."
              />
            </div>
          ) : null}
          {activeTab === "quiz" ? (
            <div className="rounded-[1.5rem] bg-surface p-8">
              <h2 className="text-xl font-bold text-text-primary">Quick Check</h2>
              <div className="mt-5 space-y-4">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-surface-low p-4">
                  <input
                    type="radio"
                    name="quiz"
                    className="mt-1 h-4 w-4 text-primary"
                    defaultChecked
                  />
                  <span className="text-sm text-text-primary">
                    Use tonal depth and restrained emphasis to create hierarchy before adding more
                    chrome.
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-surface-low p-4">
                  <input type="radio" name="quiz" className="mt-1 h-4 w-4 text-primary" />
                  <span className="text-sm text-text-primary">
                    Start with multiple accent palettes and varied spacing for each module.
                  </span>
                </label>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
