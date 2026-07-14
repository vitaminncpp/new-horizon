"use client";

import { createContext, useContext, useEffect, useState, useCallback, type PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import type { AppUser } from "@/src/services/mock/types";
import * as authService from "@/src/services/api/auth.service";

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type AuthContextValue = {
  user: AppUser | null;
  isLoading: boolean;
  error: string | null;
  login: (values: LoginInput) => Promise<boolean>;
  register: (values: RegisterInput) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getRedirectTarget(): string {
  if (typeof window === "undefined") return "/dashboard";
  const params = new URLSearchParams(window.location.search);
  return params.get("next") || "/dashboard";
}

export function AuthProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void authService
      .getCurrentUser()
      .then((u) => {
        if (active) setUser(u);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (values: LoginInput) => {
      setError(null);
      try {
        const nextUser = await authService.login(values.email, values.password);
        setUser(nextUser);
        router.push(getRedirectTarget());
        return true;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to login.");
        return false;
      }
    },
    [router],
  );

  const register = useCallback(
    async (values: RegisterInput) => {
      if (values.password !== values.confirmPassword) {
        setError("Passwords do not match.");
        return false;
      }

      setError(null);
      try {
        const nextUser = await authService.register(values);
        setUser(nextUser);
        router.push(getRedirectTarget());
        return true;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to register.");
        return false;
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
