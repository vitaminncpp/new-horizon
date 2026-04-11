import type { AppUser } from "@/src/services/mock/types";
import { http } from "@/src/services/api/http.service";

type AuthPayload = {
  user: {
    id: string;
    name: string;
    email: string;
    created_at: string;
  };
};

function mapUser(payload: AuthPayload["user"]): AppUser {
  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    password: "",
    major: "Design Major",
    plan: "Premium Student",
    role: "learner",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  };
}

export async function getCurrentUser() {
  try {
    const response = await http.get<AuthPayload>("/api/auth/me");
    return mapUser(response.user);
  } catch {
    return null;
  }
}

export async function login(email: string, password: string) {
  const response = await http.post<AuthPayload>("/api/auth/login", { email, password });
  return mapUser(response.user);
}

export async function register(payload: Pick<AppUser, "name" | "email" | "password">) {
  const response = await http.post<AuthPayload>("/api/auth/register", payload);
  return mapUser(response.user);
}

export async function logout() {
  await http.post("/api/auth/logout", {});
}
