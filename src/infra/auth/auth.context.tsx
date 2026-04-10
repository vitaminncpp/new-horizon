"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/src/infra/api/api.context";
import { API_ENDPOINTS } from "@/src/infra/config/api.config";
import { AuthEnum } from "@/src/infra/enums/auth.enum";
import { LoginRequestDto, RegisterRequestDto, AuthResponseDto } from "@/src/infra/dtos/auth.dto";
import { User } from "@/src/infra/models/user.model";

interface AuthContextType {
  user: User | null;
  login: (data: LoginRequestDto, next?: string) => Promise<void>;
  register: (data: RegisterRequestDto, next?: string) => Promise<void>;
  logout: () => void;
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
    const storedUser = localStorage.getItem(AuthEnum.USER_DATA);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (auth: AuthResponseDto, next?: string) => {
    setUser(auth.user);
    localStorage.setItem(AuthEnum.USER_DATA, JSON.stringify(auth.user));
    router.push(next || "/workspace");
  };

  const login = async (data: LoginRequestDto, next?: string) => {
    try {
      const auth = await api.post<AuthResponseDto>(API_ENDPOINTS.AUTH.LOGIN, data);
      handleAuthSuccess(auth, next);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (data: RegisterRequestDto, next?: string) => {
    try {
      const auth = await api.post<AuthResponseDto>(API_ENDPOINTS.AUTH.REGISTER, data);
      handleAuthSuccess(auth, next);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AuthEnum.USER_DATA);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
