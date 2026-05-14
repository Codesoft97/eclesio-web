import type { UserRole } from "./auth-types";

export function getHomePathForRole(role: UserRole) {
  return role === "MEMBER" ? "/portal" : "/app";
}
