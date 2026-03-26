"use client";

type EditorHeaderProps = {
  onThemeToggle: () => void;
};

const tabs = ["app.tsx", "theme.css", "utils.ts"];

export function EditorHeader({ onThemeToggle }: EditorHeaderProps) {
  return (
    <header className="rounded-3xl border border-(--border) bg-(--surface-glass) p-4 shadow-(--shadow-sm) backdrop-blur-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-(--text-secondary)">
            New Horizon
          </p>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Workspace Code Editor
          </h1>
        </div>

        <button
          type="button"
          onClick={onThemeToggle}
          className="rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-medium text-(--text-primary) transition hover:border-(--border-accent) hover:bg-(--surface-soft)"
        >
          Toggle Theme
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, idx) => (
          <button
            key={tab}
            type="button"
            className={`rounded-xl border px-3 py-1.5 text-sm transition ${
              idx === 0
                ? "border-(--border-accent) bg-(--surface-accent) text-(--text-primary)"
                : "border-(--border) bg-(--surface) text-(--text-secondary) hover:border-(--border-strong)"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </header>
  );
}
