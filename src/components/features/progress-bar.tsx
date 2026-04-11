import { cn } from "@/src/utils/cn";
import { progressWidthClass } from "@/src/utils/progress";

type ProgressBarProps = {
  value: number;
  tone?: "primary" | "secondary";
};

export function ProgressBar({ value, tone = "primary" }: ProgressBarProps) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-surface-low">
      <div
        className={cn(
          "h-full rounded-full",
          progressWidthClass(value),
          tone === "primary" ? "gradient-brand" : "gradient-accent",
        )}
      />
    </div>
  );
}
