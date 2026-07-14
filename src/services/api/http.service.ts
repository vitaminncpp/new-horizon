import { API_ENDPOINTS } from "@/src/infra/config/api.config";

const EXCLUDED_FROM_REFRESH: ReadonlySet<string> = new Set<string>([
  API_ENDPOINTS.AUTH.REFRESH,
  API_ENDPOINTS.AUTH.LOGOUT,
]);

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
      method: "POST",
      credentials: "same-origin",
    });
    return res.ok;
  } catch {
    return false;
  }
}

function getRefreshPromise(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = tryRefreshToken().finally(() => {
      refreshPromise = null;
      isRefreshing = false;
    });
    isRefreshing = true;
  }
  return refreshPromise;
}

async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    if (response.status === 401 && !EXCLUDED_FROM_REFRESH.has(input)) {
      const refreshed = await getRefreshPromise();
      if (refreshed) {
        const retryResponse = await fetch(input, {
          ...init,
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
          },
        });

        if (retryResponse.ok) {
          return (await retryResponse.json()) as T;
        }

        const retryBody = await retryResponse.json().catch(() => null) as { error?: string } | null;
        throw new Error(retryBody?.error ?? `Request failed with status ${retryResponse.status}`);
      }
    }

    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export const http = {
  get: <T>(input: string) => request<T>(input),
  post: <T>(input: string, body?: unknown) =>
    request<T>(input, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(input: string, body?: unknown) =>
    request<T>(input, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(input: string, body?: unknown) =>
    request<T>(input, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  del: <T>(input: string) =>
    request<T>(input, { method: "DELETE" }),
};
