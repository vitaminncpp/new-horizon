"use client";

import { AuthCard } from "@/src/components/features/auth-card";
import { Loader } from "@/src/components/common/loader";
import { useAuthRedirect } from "@/src/hooks/use-auth-redirect";

export default function LoginPage() {
  const auth = useAuthRedirect("guest");

  if (auth.isLoading) {
    return <Loader label="Loading login" />;
  }

  return <AuthCard mode="login" />;
}
