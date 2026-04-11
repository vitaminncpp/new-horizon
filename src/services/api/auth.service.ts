import users from "@/src/services/mock/users.json";
import type { AppUser } from "@/src/services/mock/types";

const STORAGE_KEY = "new-horizon-auth-user";

function delay<T>(value: T, ms = 220) {
  return new Promise<T>((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

function getStoredUsers() {
  if (typeof window === "undefined") {
    return users as AppUser[];
  }

  const raw = window.localStorage.getItem("new-horizon-users");
  if (!raw) {
    window.localStorage.setItem("new-horizon-users", JSON.stringify(users));
    return users as AppUser[];
  }

  return JSON.parse(raw) as AppUser[];
}

function setStoredUsers(nextUsers: AppUser[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("new-horizon-users", JSON.stringify(nextUsers));
  }
}

export async function getCurrentUser() {
  if (typeof window === "undefined") {
    return delay<AppUser | null>(null, 0);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  return delay(raw ? (JSON.parse(raw) as AppUser) : null);
}

export async function login(email: string, password: string) {
  const user = getStoredUsers().find((item) => item.email === email && item.password === password);
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  return delay(user);
}

export async function register(payload: Pick<AppUser, "name" | "email" | "password">) {
  const currentUsers = getStoredUsers();
  if (currentUsers.some((item) => item.email === payload.email)) {
    throw new Error("An account with this email already exists.");
  }

  const nextUser: AppUser = {
    id: `user-${currentUsers.length + 1}`,
    role: "learner",
    major: "Independent Learner",
    plan: "Premium Student",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    ...payload,
  };

  const nextUsers = [...currentUsers, nextUser];
  setStoredUsers(nextUsers);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
  }

  return delay(nextUser);
}

export async function logout() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return delay(undefined);
}
