"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const storageKey = "nh-theme";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "dark";
    }

    const storedTheme = localStorage.getItem(storageKey);
    if (storedTheme === "light" || storedTheme === "dark") {
      return storedTheme;
    }

    const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return preferredDark ? "dark" : "light";
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(storageKey, theme);
  }, [theme]);

  const toggle = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="rounded-full border border-(--border) bg-(--surface) px-4 py-2 text-sm font-semibold text-(--text-primary) transition hover:opacity-85"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "Switch to light" : "Switch to dark"}
    </button>
  );
}
