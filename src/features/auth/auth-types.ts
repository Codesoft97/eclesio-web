export type UserRole = "CHURCH_ADMIN" | "MEMBER";

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
  memberId: string | null;
}

export interface LegalAcceptanceStatus {
  currentTermsVersion: string;
  currentPrivacyPolicyVersion: string;
  acceptedTermsVersion: string | null;
  acceptedPrivacyPolicyVersion: string | null;
  acceptedAt: string | null;
  requiresAcceptance: boolean;
}

export type SubscriptionStatus = "FREE_TRIAL" | "FREE" | "PAID";

export type SubscriptionBillingInterval = "MONTHLY" | "YEARLY";

export interface SubscriptionAccessStatus {
  status: SubscriptionStatus;
  billingInterval: SubscriptionBillingInterval | null;
  trialEndsAt: string | null;
  currentPeriodEndsAt: string | null;
  requiresPayment: boolean;
}

export interface AuthSession {
  church: AuthenticatedChurch;
  user: AuthenticatedUser;
  legalAcceptance?: LegalAcceptanceStatus;
  subscription?: SubscriptionAccessStatus;
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
  acceptedTerms: boolean;
  acceptedPrivacyPolicy: boolean;
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
