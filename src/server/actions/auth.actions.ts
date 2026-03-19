"use server";
import * as auth from "@/src/services/auth.service";

export async function register(email: string, name: string, password: string) {
  return auth.register(email, name, password);
}

export async function login(username: string, password: string) {
  throw new Error("Auth Error");
}
