"use client";

import React, { createContext, useContext, ReactNode } from "react";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOptions {
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, string>;
}

interface ApiContextType {
  get: <T>(
    endpoint: string,
    params?: Record<string, string>,
    headers?: Record<string, string>,
  ) => Promise<T>;
  post: <T>(endpoint: string, body: any, headers?: Record<string, string>) => Promise<T>;
  put: <T>(endpoint: string, body: any, headers?: Record<string, string>) => Promise<T>;
  del: <T>(endpoint: string, headers?: Record<string, string>) => Promise<T>;
  patch: <T>(endpoint: string, body: any, headers?: Record<string, string>) => Promise<T>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
};

interface ApiProviderProps {
  children: ReactNode;
}

export const ApiProvider = ({ children }: ApiProviderProps) => {
  const request = async <T,>(
    endpoint: string,
    method: HttpMethod = "GET",
    options: RequestOptions = {},
  ): Promise<T> => {
    const { headers, body, params } = options;

    const url = new URL(endpoint, typeof window !== "undefined" ? window.location.origin : "");
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    const config: RequestInit = {
      method,
      headers: defaultHeaders,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url.toString(), config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error("API Call Error:", error);
      throw error;
    }
  };

  const api: ApiContextType = {
    get: (endpoint, params, headers) => request(endpoint, "GET", { params, headers }),
    post: (endpoint, body, headers) => request(endpoint, "POST", { body, headers }),
    put: (endpoint, body, headers) => request(endpoint, "PUT", { body, headers }),
    del: (endpoint, headers) => request(endpoint, "DELETE", { headers }),
    patch: (endpoint, body, headers) => request(endpoint, "PATCH", { body, headers }),
  };

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};
