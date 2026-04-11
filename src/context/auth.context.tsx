"use client";

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
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

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void authService
      .getCurrentUser()
      .then(setUser)
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (values: LoginInput) => {
    setError(null);
    try {
      const nextUser = await authService.login(values.email, values.password);
      setUser(nextUser);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to login.");
      return false;
    }
  };

  const register = async (values: RegisterInput) => {
    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    setError(null);
    try {
      const nextUser = await authService.register(values);
      setUser(nextUser);
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to register.");
      return false;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

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
