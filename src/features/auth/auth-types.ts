export type UserRole = "CHURCH_ADMIN";

export interface AuthenticatedChurch {
  id: string;
  name: string;
  slug: string;
}

export interface AuthenticatedUser {
  id: string;
  churchId: string;
  name: string;
  email: string;
  whatsapp: string;
  role: UserRole;
}

export interface AuthSession {
  church: AuthenticatedChurch;
  user: AuthenticatedUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  churchName: string;
  representativeName: string;
  email: string;
  whatsapp: string;
  password: string;
  passwordConfirmation: string;
}

export interface MessageResponse {
  message: string;
}

export interface RequestPasswordRecoveryPayload {
  email: string;
}

export interface VerifyPasswordRecoveryCodePayload {
  email: string;
  code: string;
}

export interface PasswordRecoveryVerificationResponse {
  resetToken: string;
  expiresInSeconds: number;
}

export interface ResetPasswordPayload {
  email: string;
  resetToken: string;
  password: string;
  passwordConfirmation: string;
}
