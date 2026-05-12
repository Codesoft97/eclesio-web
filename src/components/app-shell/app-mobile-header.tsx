"use client";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AppMobileHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur-xl lg:hidden">
      <Logo />
      <ThemeToggle />
    </header>
  );
}