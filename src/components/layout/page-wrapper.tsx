import type { PropsWithChildren } from "react";
import { Sidebar } from "@/src/components/layout/sidebar";
import { Topbar } from "@/src/components/layout/topbar";

type PageWrapperProps = PropsWithChildren<{
  searchPlaceholder: string;
  onSearch?: (value: string) => void;
}>;

export function PageWrapper({ children, searchPlaceholder, onSearch }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar />
      <Topbar searchPlaceholder={searchPlaceholder} onSearch={onSearch} />
      <main className="lg:ml-[260px]">{children}</main>
    </div>
  );
}
