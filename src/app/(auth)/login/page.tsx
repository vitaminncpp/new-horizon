"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/src/infra/auth/auth.context";

const highlights = [
  "Resume work across all your islands",
  "Track shared updates without leaving your flow",
  "Stay grounded with a calm, low-noise interface",
];

export default function Login() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const redir = `/register${next ? `?next=${next}` : ""}`;
  const { login } = useAuth();

  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });
  return (
    <main className="relative min-h-screen overflow-hidden bg-(--bg) text-(--text-primary)">
      <div className="absolute inset-0 bg-(image:--gradient-page)" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_80%_60%_at_100%_50%,oklch(0.35_0.14_280/0.30),oklch(0.25_0.10_275/0.20)_50%,transparent_70%)]" />

      <div className="relative grid min-h-screen w-full gap-10 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-14">
        <section className="order-2 flex items-center justify-center lg:order-1">
          <div className="w-full max-w-lg rounded-xl border border-(--border) bg-(--surface-glass) p-px shadow-(--shadow-lg) backdrop-blur-xl">
            <div className="rounded-xl bg-(--surface-raised) p-6 lg:p-8">
              <div className="mb-6 space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-(--primary)">
                  Welcome back
                </p>
                <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
                  Sign in to New Horizon
                </h1>
                <p className="text-sm leading-6 text-(--text-secondary)">
                  Pick up where you left off and return to your workspace.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-(--text-secondary)">Email</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--text-primary) outline-none transition focus:border-(--primary-border) focus:ring-4 focus:ring-(--ring)"
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
                      className="text-xs font-medium uppercase tracking-[0.1em] text-(--primary) transition hover:text-(--primary-hover)"
                    >
                      Reset
                    </Link>
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    className="w-full rounded-lg border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--text-primary) outline-none transition focus:border-(--primary-border) focus:ring-4 focus:ring-(--ring)"
                    onChange={(e) =>
                      setUserData({
                        ...userData,
                        password: e.target.value,
                      })
                    }
                  />
                </label>

                <div className="flex flex-col gap-2 rounded-lg border border-(--border) bg-(--surface-inset) px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <label className="flex items-center gap-3 text-(--text-secondary)">
                    <input
                      type="checkbox"
                      name="remember"
                      className="h-4 w-4 rounded border-(--border-strong) bg-(--surface) accent-(--primary) focus:ring-(--ring)"
                    />
                    <span>Keep me signed in</span>
                  </label>
                  <span className="text-(--text-tertiary)">Private device only</span>
                </div>

                <button
                  className="w-full rounded-lg bg-(--primary) px-4 py-3 text-sm font-semibold text-(--primary-contrast) shadow-(--shadow-glow) transition hover:brightness-110 active:brightness-95"
                  onClick={async () => {
                    try {
                      await login(
                        {
                          email: userData.email,
                          password: userData.password,
                        },
                        next ?? undefined,
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

              <div className="mt-5 flex flex-col gap-2 text-sm text-(--text-secondary) sm:flex-row sm:items-center sm:justify-between">
                <p>New here?</p>
                <Link
                  href={redir}
                  className="inline-flex items-center justify-center rounded-lg border border-(--border) bg-(--surface-raised) px-4 py-2 font-medium transition-all hover:border-(--primary-border) hover:bg-(--primary-soft) hover:text-(--primary)"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="order-1 flex flex-col justify-between rounded-xl border border-(--border-accent) bg-(--surface-glass) p-6 shadow-(--shadow-lg) backdrop-blur-xl lg:order-2 lg:p-8">
          <div className="space-y-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-(--primary-border) bg-(--primary-soft) px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-(--primary)">
              New Horizon
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-(--secondary)">
                Return to the shoreline
              </p>
              <h2 className="max-w-xl text-3xl font-semibold tracking-tight lg:text-4xl">
                Your focused workspace is ready when you are.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-(--text-secondary)">
                Sign back in to review updates, continue projects, and move through your day with
                the same calm visual rhythm.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {highlights.map((item, i) => (
                <div
                  key={item}
                  className="rounded-lg border border-(--border) bg-(--surface-raised) p-4 shadow-(--shadow-sm) transition-all hover:border-(--border-strong)"
                >
                  <div
                    className={`mb-2 h-8 w-8 rounded-lg border border-(--border) ${i === 0 ? "bg-(--primary-soft)" : i === 1 ? "bg-(--info-bg)" : "bg-(--success-bg)"}`}
                  />
                  <p className="text-sm leading-5 text-(--text-secondary)">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2 text-sm text-(--text-secondary)">
            <span className="rounded-lg border border-(--border) bg-(--surface-raised) px-3 py-1 text-xs">
              Session aware
            </span>
            <span className="rounded-lg border border-(--border) bg-(--surface-raised) px-3 py-1 text-xs">
              Fast re-entry
            </span>
            <span className="rounded-lg border border-(--border) bg-(--surface-raised) px-3 py-1 text-xs">
              Consistent auth UI
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
