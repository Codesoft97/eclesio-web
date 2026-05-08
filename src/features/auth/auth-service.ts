import { api } from "@/lib/api";

import type { AuthSession, LoginPayload, RegisterPayload } from "./auth-types";

export async function login(payload: LoginPayload) {
  const { data } = await api.post<AuthSession>("/auth/login", payload);
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post<AuthSession>("/auth/register", payload);
  return data;
}

export async function logout() {
  await api.post("/auth/logout");
}