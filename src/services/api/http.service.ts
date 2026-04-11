async function request<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
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
};
