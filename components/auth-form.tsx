"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

const endpointByMode: Record<AuthMode, string> = {
  login: "/api/auth/login",
  register: "/api/auth/register",
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: ChangeEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpointByMode[mode], {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await response.json();

      if (!response.ok) {
        setError(body.message ?? "Request failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error, please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-semibold text-(--text-secondary)">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-(--border) bg-(--surface-soft) px-3 py-2 text-(--text-primary) outline-none transition focus:border-(--accent)"
          placeholder="you@company.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-(--text-secondary)">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-(--border) bg-(--surface-soft) px-3 py-2 text-(--text-primary) outline-none transition focus:border-(--accent)"
          placeholder="At least 8 characters"
        />
      </div>

      {error ? (
        <p className="rounded-lg border border-(--danger-border) bg-(--danger-surface) px-3 py-2 text-sm text-(--danger-text)">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-(--accent) px-4 py-2 font-semibold text-(--accent-contrast) transition hover:opacity-90 disabled:opacity-60"
      >
        {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
      </button>
    </form>
  );
}
