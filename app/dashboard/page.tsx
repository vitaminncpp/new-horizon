import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8 md:px-10">
        <header className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="font-mono text-sm text-[var(--text-muted)]">secured area</p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </header>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl">
          <p className="mb-3 text-sm uppercase tracking-[0.15em] text-[var(--accent)]">Authenticated</p>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-[var(--text-secondary)]">You are signed in as {session.email}.</p>
        </section>
      </div>
    </main>
  );
}
