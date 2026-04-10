"use client";
import Link from "next/link";
import React, { useState } from "react";
import { AuthProvider, useAuth } from "@/src/infra/auth/auth.context";

const perks = [
  "Create a focused space for projects and notes",
  "Keep your team aligned with shared islands of work",
  "Switch between calm light and moonlit dark themes",
];

export default function Register({ searchParams }: never) {
  const params = React.use(searchParams) satisfies Record<string, string>;
  const redir = `/login${params.next ? `?next=${params.next}` : ""}`;
  const { register } = useAuth();

  const [userData, setUserData] = useState({
    name: "",
    password: "",
    workspace: "",
  });
  return (
    <AuthProvider>
      <main className="relative min-h-screen overflow-hidden bg-(--bg) text-(--text-primary)">
        <div className="absolute inset-0 bg-(image:--gradient-page)" />
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,oklch(1_0_0/0.3),transparent_70%)]" />

        <div className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-14">
          <section className="flex flex-col justify-between rounded-4xl border border-(--border-accent) bg-(--surface-glass) p-7 shadow-(--shadow-lg) backdrop-blur-xl lg:p-10">
            <div className="space-y-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-(--border) bg-(--surface-raised) px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-(--text-secondary)">
                New Horizon
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-(--text-secondary)">
                  Build your base camp
                </p>
                <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  Start with a calm workspace designed like a set of digital islands.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-(--text-secondary) sm:text-lg">
                  Create your account to organize projects, conversations, and daily momentum in one
                  place without the usual visual noise.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {perks.map((perk) => (
                  <div
                    key={perk}
                    className="rounded-3xl border border-(--border) bg-(--surface-raised) p-4 shadow-(--shadow-sm)"
                  >
                    <div className="mb-3 h-10 w-10 rounded-2xl border border-(--border) bg-(--surface-accent)" />
                    <p className="text-sm leading-6 text-(--text-secondary)">{perk}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-(--text-secondary)">
              <span className="rounded-full border border-(--border) bg-(--surface) px-3 py-1.5">
                Private by default
              </span>
              <span className="rounded-full border border-(--border) bg-(--surface) px-3 py-1.5">
                Fast onboarding
              </span>
              <span className="rounded-full border border-(--border) bg-(--surface) px-3 py-1.5">
                Island-inspired UI
              </span>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-4xl border border-(--border) bg-(image:--gradient-island) p-px shadow-(--shadow-lg)">
              <div className="rounded-[calc(2rem-1px)] bg-(--surface-raised) p-7 backdrop-blur-xl sm:p-8">
                <div className="mb-8 space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight">Create account</h2>
                  <p className="text-sm leading-6 text-(--text-secondary)">
                    Enter your details to launch your workspace.
                  </p>
                </div>

                <div className="space-y-5">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-(--text-secondary)">Full Name</span>
                    <input
                      type="text"
                      name="name"
                      placeholder="Ava"
                      className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--text-primary) outline-none transition focus:border-(--border-accent) focus:ring-4 focus:ring-(--ring)"
                      onChange={(event) =>
                        setUserData({
                          ...userData,
                          name: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-(--text-secondary)">Email</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--text-primary) outline-none transition focus:border-(--border-accent) focus:ring-4 focus:ring-(--ring)"
                      onChange={(event) =>
                        setUserData({
                          ...userData,
                          email: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-(--text-secondary)">Password</span>
                    <input
                      type="password"
                      name="password"
                      placeholder="Create a strong password"
                      className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--text-primary) outline-none transition focus:border-(--border-accent) focus:ring-4 focus:ring-(--ring)"
                      onChange={(event) =>
                        setUserData({
                          ...userData,
                          password: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-(--text-secondary)">
                      Workspace name
                    </span>
                    <input
                      type="text"
                      name="workspace"
                      placeholder="North Star Studio"
                      className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--text-primary) outline-none transition focus:border-(--border-accent) focus:ring-4 focus:ring-(--ring)"
                      onChange={(event) =>
                        setUserData({
                          ...userData,
                          workspace: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label className="flex items-start gap-3 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--text-secondary)">
                    <input
                      type="checkbox"
                      name="terms"
                      className="mt-1 h-4 w-4 rounded border-(--border-strong) bg-(--surface-inset) accent-(--primary) focus:ring-(--ring)"
                    />
                    <span>
                      I agree to the terms and want product updates about features, launches, and
                      release notes.
                    </span>
                  </label>

                  <button
                    className="w-full rounded-2xl bg-(--primary) px-4 py-3 text-sm font-semibold text-(--primary-contrast) shadow-(--shadow-md) transition hover:bg-(--primary-hover) active:bg-(--primary-active)"
                    onClick={async () => {
                      try {
                        await register(
                          {
                            email: userData.email,
                            name: userData.name,
                            password: userData.password,
                          },
                          params.next,
                        );
                      } catch (err: unknown) {
                        console.error("Registration error:", (err as Error).message);
                        alert((err as Error).message || "Registration failed");
                      }
                    }}
                  >
                    SIGN UP
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-3 text-sm text-(--text-secondary) sm:flex-row sm:items-center sm:justify-between">
                  <p>Already have an account?</p>
                  <Link
                    href={redir}
                    className="inline-flex items-center justify-center rounded-full border border-(--border) bg-(--surface) px-4 py-2 font-medium text-(--text-primary) transition hover:border-(--border-accent) hover:bg-(--surface-soft)"
                  >
                    Log in
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </AuthProvider>
  );
}
