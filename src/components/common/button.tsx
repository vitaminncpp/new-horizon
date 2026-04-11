import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/src/utils/cn";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
    fullWidth?: boolean;
  }
>;

export function Button({
  children,
  className,
  variant = "primary",
  fullWidth = false,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl px-6 py-3 text-sm font-bold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" &&
          "bg-primary text-[color:var(--color-text-on-primary)] shadow-[0_20px_40px_rgba(85,67,207,0.2)] hover:bg-primary-dim",
        variant === "secondary" &&
          "bg-surface-lowest text-text-primary shadow-[0_20px_40px_rgba(15,23,42,0.06)] hover:bg-surface-high",
        variant === "ghost" &&
          "bg-transparent text-text-secondary hover:bg-white/5 hover:text-text-primary",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
