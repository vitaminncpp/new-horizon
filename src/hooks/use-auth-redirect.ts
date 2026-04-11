"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/auth.context";

export function useAuthRedirect(target: "guest" | "private") {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (target === "private" && !user) {
      router.replace("/login");
    }

    if (target === "guest" && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, router, target, user]);

  return { user, isLoading };
}
