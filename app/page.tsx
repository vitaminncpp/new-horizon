import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-(--bg) text-(--text-primary)">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-8 md:px-10">
        <header className="flex items-center justify-between">
          <p className="font-mono text-sm text-(--text-muted)">new-horizen</p>
          <ThemeToggle />
        </header>

        <section className="grid items-center gap-8 rounded-3xl border border-(--border) bg-(--surface) p-8 shadow-2xl md:grid-cols-2 md:p-12">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-(--accent)">
              Authentication Platform
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Secure login and registration with scalable architecture.
            </h1>
            <p className="max-w-xl text-base text-[var(--text-secondary)] md:text-lg">
              Built with Next.js App Router, Prisma ORM, PostgreSQL, and layered domain-driven auth services.
            </p>
            <div className="flex gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-[var(--accent)] px-5 py-2.5 font-semibold text-[var(--accent-contrast)] transition hover:opacity-90"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-(--border) bg-(--surface-soft) px-5 py-2.5 font-semibold transition hover:opacity-85"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="relative h-64 overflow-hidden rounded-2xl border border-(--border) bg-(--surface-soft) md:h-full">
            <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-(--accent)/35 blur-2xl" />
            <div className="absolute bottom-8 left-8 h-28 w-28 rounded-full bg-(--highlight)/35 blur-2xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,transparent_0,transparent_14px,var(--bg-pattern)_15px)] [background-size:20px_20px] opacity-35" />
          </div>
        </section>
      </div>
    </main>
  );
}
