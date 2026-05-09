"use client";

import { PostHogIdentifier } from "@/components/analytics/posthog-identifier";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/features/auth/auth-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PostHogIdentifier />
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}