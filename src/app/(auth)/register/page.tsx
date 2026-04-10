"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/src/infra/auth/auth.context";

const perks = [
  "Create a focused space for projects and notes",
  "Keep your team aligned with shared islands of work",
  "Switch between calm light and moonlit dark themes",
];

export default function Register() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const redir = `/login${next ? `?next=${next}` : ""}`;
  const { register } = useAuth();

  const [userData, setUserData] = useState({
    email: "",
    name: "",
    password: "",
    workspace: "",
  });
  return (
    <main className="relative min-h-screen overflow-hidden bg-(--bg) text-(--text-primary)">
      <div className="absolute inset-0 bg-(image:--gradient-page)" />
      <div className="absolute inset-x-0 top-0 h-[400px] bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,oklch(0.40_0.16_280/0.25),oklch(0.28_0.12_275/0.15)_40%,transparent_70%)]" />

      <div className="relative grid min-h-screen w-full gap-10 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:py-14">
        <section className="flex flex-col justify-between rounded-xl border border-(--border-accent) bg-(--surface-glass) p-6 shadow-(--shadow-lg) backdrop-blur-xl lg:p-8">
          <div className="space-y-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-(--primary-border) bg-(--primary-soft) px-3 py-1 text-xs font-medium uppercase tracking-[0.15em] text-(--primary)">
              New Horizon
            </div>

            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-(--accent)">
                Build your base camp
              </p>
              <h1 className="text-3xl font-semibold tracking-tight lg:text-4xl">
                Start with a calm workspace designed like a set of digital islands.
              </h1>
              <p className="text-base leading-7 text-(--text-secondary)">
                Create your account to organize projects, conversations, and daily momentum in one
                place without the usual visual noise.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {perks.map((perk, i) => (
                <div
                  key={perk}
                  className="rounded-lg border border-(--border) bg-(--surface-raised) p-4 shadow-(--shadow-sm) transition-all hover:border-(--border-strong)"
                >
                  <div
                    className={`mb-2 h-8 w-8 rounded-lg border border-(--border) ${i === 0 ? "bg-(--success-bg)" : i === 1 ? "bg-(--info-bg)" : "bg-(--warning-bg)"}`}
                  />
                  <p className="text-sm leading-5 text-(--text-secondary)">{perk}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-2 text-sm text-(--text-secondary)">
            <span className="rounded-lg border border-(--border) bg-(--surface-raised) px-3 py-1 text-xs">
              Private by default
            </span>
            <span className="rounded-lg border border-(--border) bg-(--surface-raised) px-3 py-1 text-xs">
              Fast onboarding
            </span>
            <span className="rounded-lg border border-(--border) bg-(--surface-raised) px-3 py-1 text-xs">
              Island-inspired UI
            </span>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <div className="w-full rounded-xl border border-(--border) bg-(--surface-glass) p-px shadow-(--shadow-lg) backdrop-blur-xl">
            <div className="rounded-xl bg-(--surface-raised) p-6 lg:p-8">
              <div className="mb-6 space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-(--primary)">
                  Get started
                </p>
                <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
                  Create account
                </h2>
                <p className="text-sm leading-6 text-(--text-secondary)">
                  Enter your details to launch your workspace.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-(--text-secondary)">Full Name</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ava"
                    className="w-full rounded-lg border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--text-primary) outline-none transition focus:border-(--primary-border) focus:ring-4 focus:ring-(--ring)"
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
                    className="w-full rounded-lg border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--text-primary) outline-none transition focus:border-(--primary-border) focus:ring-4 focus:ring-(--ring)"
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
                    className="w-full rounded-lg border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--text-primary) outline-none transition focus:border-(--primary-border) focus:ring-4 focus:ring-(--ring)"
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
                    className="w-full rounded-lg border border-(--border) bg-(--surface) px-4 py-3 text-sm text-(--text-primary) outline-none transition focus:border-(--primary-border) focus:ring-4 focus:ring-(--ring)"
                    onChange={(event) =>
                      setUserData({
                        ...userData,
                        workspace: event.target.value,
                      })
                    }
                  />
                </label>

                <label className="flex items-start gap-3 rounded-lg border border-(--border) bg-(--surface-inset) px-4 py-3 text-sm text-(--text-secondary)">
                  <input
                    type="checkbox"
                    name="terms"
                    className="mt-0.5 h-4 w-4 rounded border-(--border-strong) bg-(--surface) accent-(--primary) focus:ring-(--ring)"
                  />
                  <span>
                    I agree to the terms and want product updates about features, launches, and
                    release notes.
                  </span>
                </label>

                <button
                  className="w-full rounded-lg bg-(--primary) px-4 py-3 text-sm font-semibold text-(--primary-contrast) shadow-(--shadow-glow) transition hover:brightness-110 active:brightness-95"
                  onClick={async () => {
                    try {
                      await register(
                        {
                          email: userData.email,
                          name: userData.name,
                          password: userData.password,
                        },
                        next ?? undefined,
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

              <div className="mt-5 flex flex-col gap-2 text-sm text-(--text-secondary) sm:flex-row sm:items-center sm:justify-between">
                <p>Already have an account?</p>
                <Link
                  href={redir}
                  className="inline-flex items-center justify-center rounded-lg border border-(--border) bg-(--surface-raised) px-4 py-2 font-medium transition-all hover:border-(--primary-border) hover:bg-(--primary-soft) hover:text-(--primary)"
                >
                  Log in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
