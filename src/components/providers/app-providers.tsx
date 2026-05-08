"use client";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/features/auth/auth-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
