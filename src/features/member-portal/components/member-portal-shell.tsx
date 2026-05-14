"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AUTH_STORAGE_KEY, useAuth } from "@/features/auth/auth-provider";
import type { UserRole } from "@/features/auth/auth-types";

import { MemberPortalMobileHeader } from "./member-portal-mobile-header";
import { MemberPortalMobileNav } from "./member-portal-mobile-nav";
import { MemberPortalSidebar } from "./member-portal-sidebar";

function readStoredRole(): UserRole | null {
  const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(storedSession) as {
      user?: { role?: UserRole };
    };
    const role = parsedSession.user?.role;

    return role === "CHURCH_ADMIN" || role === "MEMBER" ? role : null;
  } catch {
    return null;
  }
}

export function MemberPortalShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      if (session.user.role === "CHURCH_ADMIN") {
        router.replace("/app");
      }

      return;
    }

    const storedRole = readStoredRole();

    if (storedRole === "CHURCH_ADMIN") {
      router.replace("/app");
      return;
    }

    if (!storedRole) {
      router.replace("/login");
    }
  }, [router, session]);

  if (!session || session.user.role !== "MEMBER") {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="animate-spin text-accent" size={18} />
          Carregando portal...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" data-ph-mask>
      <MemberPortalMobileHeader />
      <div className="grid min-h-screen lg:grid-cols-[17rem_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <MemberPortalSidebar />
        </div>
        <main className="min-w-0 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mb-6 hidden justify-end lg:flex">
            <ThemeToggle />
          </div>
          <div className="animate-fade-in">{children}</div>
        </main>
      </div>
      <MemberPortalMobileNav />
    </div>
  );
}
