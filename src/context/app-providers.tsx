"use client";

import type { PropsWithChildren } from "react";
import { ThemeProvider } from "@/src/context/theme.context";
import { AuthProvider } from "@/src/context/auth.context";
import { LearningProvider } from "@/src/context/learning.context";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LearningProvider>{children}</LearningProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
