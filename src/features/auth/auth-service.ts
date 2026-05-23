import { api } from "@/lib/api";

import type {
  AuthSession,
  LoginPayload,
  MessageResponse,
  PasswordRecoveryVerificationResponse,
  RegisterPayload,
  RequestPasswordRecoveryPayload,
  ResetPasswordPayload,
  UpdateCurrentAccountPayload,
  VerifyPasswordRecoveryCodePayload,
} from "./auth-types";

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

export async function acceptLegalDocuments() {
  const { data } = await api.post<AuthSession>("/auth/legal-acceptance");
  return data;
}

export async function updateCurrentAccount(payload: UpdateCurrentAccountPayload) {
  const { data } = await api.patch<AuthSession>("/auth/me", payload);
  return data;
}

export async function requestPasswordRecovery(
  payload: RequestPasswordRecoveryPayload,
) {
  const { data } = await api.post<MessageResponse>(
    "/auth/password-recovery/request",
    payload,
  );
  return data;
}

export async function verifyPasswordRecoveryCode(
  payload: VerifyPasswordRecoveryCodePayload,
) {
  const { data } = await api.post<PasswordRecoveryVerificationResponse>(
    "/auth/password-recovery/verify",
    payload,
  );
  return data;
}

export async function resetPassword(payload: ResetPasswordPayload) {
  const { data } = await api.post<MessageResponse>(
    "/auth/password-recovery/reset",
    payload,
  );
  return data;
}
