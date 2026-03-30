"use client";

export default function Workspace() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-(--bg) text-(--text-primary)">
      <div className="absolute inset-0 bg-(image:--gradient-page)" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <section className="grid flex-1 gap-4 lg:grid-cols-[220px_1fr_340px]"></section>
      </div>
    </main>
  );
}
