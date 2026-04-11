import type { InputHTMLAttributes } from "react";
import { cn } from "@/src/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
};

export function Input({ label, error, className, id, ...props }: InputProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <label className="block">
      <span className="mb-3 block text-[11px] font-bold uppercase tracking-[0.12em] text-text-secondary">
        {label}
      </span>
      <input
        id={fieldId}
        className={cn(
          "w-full rounded-xl border border-border-soft bg-surface-low px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-primary/40",
          error && "border-error/40 focus:ring-error/20",
          className,
        )}
        {...props}
      />
      {error ? <span className="mt-2 block text-xs text-error">{error}</span> : null}
    </label>
  );
}
