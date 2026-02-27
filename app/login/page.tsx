import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-8 md:px-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="font-mono text-sm text-[var(--text-muted)]">
            new-horizen
          </Link>
          <ThemeToggle />
        </header>

        <section className="mx-auto w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl">
          <h1 className="mb-2 text-3xl font-bold">Welcome back</h1>
          <p className="mb-6 text-sm text-[var(--text-secondary)]">Sign in to continue to your dashboard.</p>
          <AuthForm mode="login" />
          <p className="mt-5 text-sm text-[var(--text-secondary)]">
            New here?{" "}
            <Link href="/register" className="font-semibold text-[var(--accent)] hover:underline">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
