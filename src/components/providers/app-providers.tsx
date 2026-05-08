"use client";

import { ThemeProvider } from "next-themes";

import { AuthProvider } from "@/features/auth/auth-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}