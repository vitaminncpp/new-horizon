"use client";

import { AuthCard } from "@/src/components/features/auth-card";
import { Loader } from "@/src/components/common/loader";
import { useAuthRedirect } from "@/src/hooks/use-auth-redirect";

export default function RegisterPage() {
  const auth = useAuthRedirect("guest");

  if (auth.isLoading) {
    return <Loader label="Loading register" />;
  }

  return <AuthCard mode="register" />;
}
