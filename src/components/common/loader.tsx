export function Loader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] items-center justify-center">
      <div className="flex items-center gap-3 rounded-full bg-surface-low px-4 py-3 text-sm font-semibold text-text-secondary">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
        {label}
      </div>
    </div>
  );
}
