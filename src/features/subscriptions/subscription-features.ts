import type { SubscriptionAccessStatus } from "@/features/auth/auth-types";

export const COMPLETE_PLAN_PATHS = [
  "/app/membros",
  "/app/financeiro",
  "/app/doacoes",
  "/app/comunicados",
  "/app/relatorios",
];

export function hasCompletePlan(subscription?: SubscriptionAccessStatus | null) {
  return (
    subscription?.planCode === "COMPLETE" ||
    (subscription?.planCode == null && subscription?.status === "PAID")
  );
}

export function isBasicPlan(subscription?: SubscriptionAccessStatus | null) {
  return (
    subscription?.planCode === "BASIC" ||
    (subscription?.planCode == null && subscription?.status === "FREE_TRIAL")
  );
}

export function canTryCompletePlan(
  subscription?: SubscriptionAccessStatus | null,
) {
  return subscription?.status === "FREE_TRIAL" && isBasicPlan(subscription);
}

export function isCompleteOnlyPath(pathname: string) {
  return COMPLETE_PLAN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}
