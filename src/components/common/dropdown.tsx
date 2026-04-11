"use client";

import { useState } from "react";
import { cn } from "@/src/utils/cn";
import { Icon } from "@/src/components/common/icon";

type DropdownProps = {
  label: string;
  items: string[];
  value: string;
  onChange: (value: string) => void;
};

export function Dropdown({ label, items, value, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-[color:var(--color-text-on-primary)] shadow-[0_20px_40px_rgba(85,67,207,0.2)]"
      >
        {label}: {value}
        <Icon name={open ? "expand_less" : "expand_more"} className="text-base" />
      </button>
      {open ? (
        <div
          role="listbox"
          className="absolute right-0 top-full z-20 mt-2 min-w-40 rounded-xl border border-border-soft bg-surface-lowest p-2 card-shadow"
        >
          {items.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                onChange(item);
                setOpen(false);
              }}
              className={cn(
                "block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                item === value
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-surface-low",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
