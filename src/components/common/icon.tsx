import { cn } from "@/src/utils/cn";

type IconProps = {
  name: string;
  filled?: boolean;
  className?: string;
};

export function Icon({ name, filled = false, className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined", filled && "icon-filled", className)}
    >
      {name}
    </span>
  );
}
