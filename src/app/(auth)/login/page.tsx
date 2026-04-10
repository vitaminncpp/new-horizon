"use client";
import Link from "next/link";
import React from "react";
import { useState } from "react";
import { AuthProvider, useAuth } from "@/src/infra/auth/auth.context";

const highlights = [
  "Resume work across all your islands",
  "Track shared updates without leaving your flow",
  "Stay grounded with a calm, low-noise interface",
];

export default function Login({ searchParams }: never) {
  const params = React.use(searchParams) satisfies Record<string, string>;
  const redir = `/register${params.next ? `?next=${params.next}` : ""}`;
  const { login } = useAuth();

  const [userData, setUserData] = useState({
    password: "",
  });
  return (
    <AuthProvider>
      <main className="relative min-h-screen overflow-hidden bg-(--bg) text-(--text-primary)">
        <div className="absolute inset-0 bg-(image:--gradient-page)" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,oklch(0.92_0.05_196/0.28),transparent_72%)]" />

        <div className="relative mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-14">
          <section className="flex items-center justify-center order-2 lg:order-1">
            <div className="w-full max-w-md rounded-4xl border border-(--border) bg-(image:--gradient-island) p-px shadow-(--shadow-lg)">
              <div className="rounded-[calc(2rem-1px)] bg-(--surface-raised) p-7 backdrop-blur-xl sm:p-8">
                <div className="mb-8 space-y-2">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-(--text-secondary)">
                    Welcome back
                  </p>
                  <h1 className="text-3xl font-semibold tracking-tight">Sign in to New Horizon</h1>
                  <p className="text-sm leading-6 text-(--text-secondary)">
                    Pick up where you left off and return to your workspace.
                  </p>
                </div>

                <div className="space-y-5">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-(--text-secondary)">Email</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--text-primary) outline-none transition focus:border-(--border-accent) focus:ring-4 focus:ring-(--ring)"
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          email: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label className="block space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-(--text-secondary)">Password</span>
                      <Link
                        href="#"
                        className="text-xs font-medium uppercase tracking-[0.18em] text-(--primary) transition hover:text-(--primary-hover)"
                      >
                        Reset
                      </Link>
                    </div>
                    <input
                      type="password"
                      name="password"
                      placeholder="Enter your password"
                      className="w-full rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--text-primary) outline-none transition focus:border-(--border-accent) focus:ring-4 focus:ring-(--ring)"
                      onChange={(e) =>
                        setUserData({
                          ...userData,
                          password: e.target.value,
                        })
                      }
                    />
                  </label>

                  <div className="flex flex-col gap-3 rounded-2xl border border-(--border) bg-(--surface) px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-3 text-(--text-secondary)">
                      <input
                        type="checkbox"
                        name="remember"
                        className="h-4 w-4 rounded border-(--border-strong) bg-(--surface-inset) accent-(--primary) focus:ring-(--ring)"
                      />
                      <span>Keep me signed in</span>
                    </label>
                    <span className="text-(--text-tertiary)">Private device only</span>
                  </div>

                  <button
                    className="w-full rounded-2xl bg-(--primary) px-4 py-3 text-sm font-semibold text-(--primary-contrast) shadow-(--shadow-md) transition hover:bg-(--primary-hover) active:bg-(--primary-active)"
                    onClick={async () => {
                      try {
                        await login(
                          {
                            email: userData.email,
                            password: userData.password,
                          },
                          params.next,
                        );
                      } catch (err: unknown) {
                        console.error("Login error:", (err as Error).message);
                        alert((err as Error).message || "Login failed");
                      }
                    }}
                  >
                    Enter workspace
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-3 text-sm text-(--text-secondary) sm:flex-row sm:items-center sm:justify-between">
                  <p>New here?</p>
                  <Link
                    href={redir}
                    className="inline-flex items-center justify-center rounded-full border border-(--border) bg-(--surface) px-4 py-2 font-medium text-(--text-primary) transition hover:border-(--border-accent) hover:bg-(--surface-soft)"
                  >
                    Create account
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="order-1 flex flex-col justify-between rounded-4xl border border-(--border-accent) bg-(--surface-glass) p-7 shadow-(--shadow-lg) backdrop-blur-xl lg:order-2 lg:p-10">
            <div className="space-y-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-(--border) bg-(--surface-raised) px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-(--text-secondary)">
                New Horizon
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-(--text-secondary)">
                  Return to the shoreline
                </p>
                <h2 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                  Your focused workspace is ready when you are.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-(--text-secondary) sm:text-lg">
                  Sign back in to review updates, continue projects, and move through your day with
                  the same calm visual rhythm.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="rounded-3xl border border-(--border) bg-(--surface-raised) p-4 shadow-(--shadow-sm)"
                  >
                    <div className="mb-3 h-10 w-10 rounded-2xl border border-(--border) bg-(--surface-accent)" />
                    <p className="text-sm leading-6 text-(--text-secondary)">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-(--text-secondary)">
              <span className="rounded-full border border-(--border) bg-(--surface) px-3 py-1.5">
                Session aware
              </span>
              <span className="rounded-full border border-(--border) bg-(--surface) px-3 py-1.5">
                Fast re-entry
              </span>
              <span className="rounded-full border border-(--border) bg-(--surface) px-3 py-1.5">
                Consistent auth UI
              </span>
            </div>
          </section>
        </div>
      </main>
    </AuthProvider>
  );
}
