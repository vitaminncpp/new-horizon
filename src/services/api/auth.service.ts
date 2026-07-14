import type { AppUser } from "@/src/services/mock/types";
import { http } from "@/src/services/api/http.service";
import { API_ENDPOINTS } from "@/src/infra/config/api.config";

type ServerUser = {
  id: string;
  name: string;
  email: string;
  role: "learner" | "instructor" | "admin";
};

type AuthPayload = {
  user: ServerUser;
};

function mapUser(serverUser: ServerUser): AppUser {
  return {
    id: serverUser.id,
    name: serverUser.name,
    email: serverUser.email,
    password: "",
    role: serverUser.role,
    major: "",
    plan: "",
    avatar: "",
  };
}

export async function getCurrentUser(): Promise<AppUser | null> {
  try {
    const response = await http.get<AuthPayload>(API_ENDPOINTS.AUTH.ME);
    return mapUser(response.user);
  } catch {
    return null;
  }
}

export async function login(email: string, password: string): Promise<AppUser> {
  const response = await http.post<AuthPayload>(API_ENDPOINTS.AUTH.LOGIN, { email, password });
  return mapUser(response.user);
}

export async function register(
  payload: Pick<AppUser, "name" | "email" | "password">,
): Promise<AppUser> {
  const response = await http.post<AuthPayload>(API_ENDPOINTS.AUTH.REGISTER, payload);
  return mapUser(response.user);
}

export async function logout(): Promise<void> {
  await http.post(API_ENDPOINTS.AUTH.LOGOUT, {});
}
