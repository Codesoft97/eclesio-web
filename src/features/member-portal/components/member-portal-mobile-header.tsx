"use client";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { LogoutIconButton } from "@/features/auth/components/logout-icon-button";

export function MemberPortalMobileHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur-xl lg:hidden">
      <Logo />
      <div className="flex shrink-0 items-center gap-2">
        <ThemeToggle />
        <LogoutIconButton />
      </div>
    </header>
  );
}
