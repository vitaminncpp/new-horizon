"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/src/infra/api/api.context";
import { API_ENDPOINTS } from "@/src/infra/config/api.config";
import { AuthResponseDto, LoginRequestDto, RegisterRequestDto } from "@/src/infra/dtos/auth.dto";
import { User } from "@/src/infra/models/user.model";

interface AuthContextType {
  user: User | null;
  login: (data: LoginRequestDto, next?: string) => Promise<void>;
  register: (data: RegisterRequestDto, next?: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const api = useApi();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const auth = await api.get<AuthResponseDto>(API_ENDPOINTS.AUTH.ME);
        if (isMounted) {
          setUser(auth.user);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [api]);

  const handleAuthSuccess = (auth: AuthResponseDto, next?: string) => {
    setUser(auth.user);
    router.push(next || "/workspace");
    router.refresh();
  };

  const login = async (data: LoginRequestDto, next?: string) => {
    const auth = await api.post<AuthResponseDto>(API_ENDPOINTS.AUTH.LOGIN, data);
    handleAuthSuccess(auth, next);
  };

  const register = async (data: RegisterRequestDto, next?: string) => {
    const auth = await api.post<AuthResponseDto>(API_ENDPOINTS.AUTH.REGISTER, data);
    handleAuthSuccess(auth, next);
  };

  const logout = async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    } finally {
      setUser(null);
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
