"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/utils/cn";
import { Icon } from "@/src/components/common/icon";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/courses", label: "My Courses", icon: "school" },
  { href: "/courses", label: "Explore", icon: "explore", match: "/courses" },
  { href: "/profile", label: "Learning Path", icon: "route", match: "/profile" },
  { href: "/dashboard", label: "Assignments", icon: "assignment", match: "/assignments" },
  { href: "/dashboard", label: "Quizzes", icon: "quiz", match: "/quizzes" },
  { href: "/profile", label: "Progress", icon: "trending_up" },
  { href: "/profile", label: "Messages", icon: "mail", match: "/messages" },
  { href: "/profile", label: "Settings", icon: "settings", match: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[260px] flex-col border-r border-border-soft bg-sidebar px-6 py-6 backdrop-blur-xl lg:fixed lg:left-0 lg:top-0 lg:flex">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-white">
          <Icon name="school" filled className="text-xl" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-primary">LearnSphere</h1>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-text-secondary">
            Academic Curator
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item, index) => {
          const active =
            pathname === item.href ||
            pathname.startsWith(item.match ?? `${item.href}/`) ||
            (item.href === "/courses" && pathname.startsWith("/course/")) ||
            (item.label === "My Courses" && pathname.startsWith("/courses/"));

          return (
            <Link
              key={`${item.label}-${index}`}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors",
                active
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-text-secondary hover:bg-surface-low hover:text-primary",
              )}
            >
              <Icon name={item.icon} className="text-xl" filled={active} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-6 rounded-xl bg-surface-low p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-text-secondary">
          Pro Plan
        </p>
        <p className="mb-3 text-xs leading-relaxed text-text-secondary">
          Access to all premium certifications.
        </p>
        <button
          type="button"
          className="w-full rounded-lg bg-primary py-2 text-xs font-bold text-[color:var(--color-text-on-primary)]"
        >
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}
