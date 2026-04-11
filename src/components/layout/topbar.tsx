/* eslint-disable @next/next/no-img-element */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/src/components/common/icon";
import { useAuth } from "@/src/context/auth.context";
import { useTheme } from "@/src/context/theme.context";

export function Topbar({
  searchPlaceholder,
  onSearch,
}: {
  searchPlaceholder: string;
  onSearch?: (value: string) => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [value, setValue] = useState("");

  return (
    <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between bg-topbar px-4 shadow-[0_20px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl lg:ml-[260px] lg:px-8 dark:shadow-[0_20px_40px_rgba(0,0,0,0.28)]">
      <div className="flex flex-1 items-center">
        <div className="relative w-full max-w-xl">
          <Icon
            name="search"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
          />
          <input
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              onSearch?.(event.target.value);
            }}
            className="w-full rounded-xl bg-surface-low py-2.5 pl-12 pr-4 text-sm text-text-primary focus:ring-2 focus:ring-primary/40"
            placeholder={searchPlaceholder}
            aria-label="Search"
          />
        </div>
      </div>
      <div className="ml-4 flex items-center gap-5">
        <div className="hidden items-center gap-2 text-text-secondary sm:flex">
          <button
            type="button"
            className="rounded-full p-2 transition-colors hover:bg-surface-low hover:text-primary"
          >
            <Icon name="notifications" />
          </button>
          <button
            type="button"
            className="rounded-full p-2 transition-colors hover:bg-surface-low hover:text-primary"
          >
            <Icon name="mail" />
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full p-2 transition-colors hover:bg-surface-low hover:text-primary"
            aria-label="Toggle theme"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            <Icon name={theme === "light" ? "dark_mode" : "light_mode"} />
          </button>
        </div>
        <div className="hidden h-8 w-px bg-border-soft sm:block" />
        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="hidden text-right sm:block">
              <p className="text-sm font-bold text-text-primary">{user.name}</p>
              <p className="text-[10px] font-medium text-text-secondary">{user.plan}</p>
            </Link>
            <img
              alt={user.name}
              src={user.avatar}
              className="h-10 w-10 rounded-xl object-cover ring-2 ring-primary/10"
            />
            {pathname !== "/login" && pathname !== "/register" ? (
              <button
                type="button"
                onClick={() => void logout()}
                className="hidden rounded-lg bg-surface-low px-3 py-2 text-xs font-bold text-text-primary transition-colors hover:bg-surface-high md:block"
              >
                Sign out
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
