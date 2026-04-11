"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/src/components/common/button";
import { Input } from "@/src/components/common/input";
import { useAuth } from "@/src/context/auth.context";

type AuthCardProps = {
  mode: "login" | "register";
};

export function AuthCard({ mode }: AuthCardProps) {
  const router = useRouter();
  const { login, register, error } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [values, setValues] = useState({
    name: "",
    email: "alex@learnsphere.app",
    password: "Password123!",
    confirmPassword: "",
  });

  const isRegister = mode === "register";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);

    const success = isRegister
      ? await register({
          name: values.name,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
        })
      : await login({
          email: values.email,
          password: values.password,
        });

    setSubmitting(false);

    if (success) {
      router.push("/dashboard");
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[420px_1fr]">
      <section className="flex items-center justify-center border-b border-border-soft bg-surface-low px-6 py-16 lg:border-b-0 lg:border-r">
        <div className="w-full max-w-sm rounded-[1.5rem] bg-surface-lowest p-8 card-shadow dark:card-shadow-dark">
          <div className="mb-8">
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
              LearnSphere Access
            </span>
            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-text-primary">
              {isRegister ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              {isRegister
                ? "Join the interactive learning platform with the same curated visual language as the core dashboard."
                : "Sign in to continue your current learning path and return to the dashboard workspace."}
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleSubmit}>
            {isRegister ? (
              <Input
                label="Name"
                value={values.name}
                onChange={(event) =>
                  setValues((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
            ) : null}
            <Input
              label="Email"
              type="email"
              value={values.email}
              onChange={(event) =>
                setValues((current) => ({ ...current, email: event.target.value }))
              }
              required
            />
            <Input
              label="Password"
              type="password"
              value={values.password}
              onChange={(event) =>
                setValues((current) => ({ ...current, password: event.target.value }))
              }
              required
            />
            {isRegister ? (
              <Input
                label="Confirm Password"
                type="password"
                value={values.confirmPassword}
                onChange={(event) =>
                  setValues((current) => ({ ...current, confirmPassword: event.target.value }))
                }
                required
              />
            ) : null}
            {!isRegister ? (
              <div className="text-right">
                <a href="#" className="text-xs font-semibold text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
            ) : null}
            {error ? <p className="text-sm text-error">{error}</p> : null}
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? "Please wait..." : isRegister ? "Register" : "Login"}
            </Button>
          </form>
          <p className="mt-6 text-sm text-text-secondary">
            {isRegister ? "Already have an account?" : "Need an account?"}{" "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="font-bold text-primary hover:underline"
            >
              {isRegister ? "Login" : "Register"}
            </Link>
          </p>
        </div>
      </section>
      <section className="relative hidden overflow-hidden bg-surface lg:block">
        <div className="absolute inset-0 gradient-brand opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(0,201,167,0.25),transparent_35%)]" />
        <div className="relative flex h-full items-center justify-center px-16 py-20">
          <div className="max-w-xl text-white">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/75">
              Academic Curator
            </p>
            <h2 className="mt-5 text-5xl font-extrabold leading-tight tracking-tight">
              Curated learning for modern professionals.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-white/75">
              The auth surfaces reuse the same card density, typography scale, and primary gradients
              established in the dashboard skeletons.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
