import { cn } from "@/src/utils/cn";

type Tab = {
  value: string;
  label: string;
};

type TabsProps = {
  value: string;
  onChange: (value: string) => void;
  items: Tab[];
};

export function Tabs({ value, onChange, items }: TabsProps) {
  return (
    <div className="flex rounded-xl bg-surface-container p-1">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            "rounded-lg px-6 py-2 text-sm font-medium transition-colors",
            value === item.value
              ? "bg-surface-lowest text-text-primary shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
              : "text-text-secondary hover:text-text-primary",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
