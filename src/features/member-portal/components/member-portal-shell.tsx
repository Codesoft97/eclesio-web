"use client";

import { Loader2, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/auth-service";
import { AUTH_STORAGE_KEY, useAuth } from "@/features/auth/auth-provider";
import type { UserRole } from "@/features/auth/auth-types";

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
  const { session, clearSession } = useAuth();
  const [isPending, startTransition] = useTransition();

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

  function handleLogout() {
    startTransition(async () => {
      try {
        await logout();
      } finally {
        clearSession();
        router.push("/login");
      }
    });
  }

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
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Logo />
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-surface-subtle px-3 py-2 text-sm text-muted sm:flex">
              <UserRound size={16} />
              <span className="max-w-40 truncate">{session.user.name}</span>
            </div>
            <ThemeToggle />
            <Button
              type="button"
              variant="ghost"
              onClick={handleLogout}
              disabled={isPending}
              aria-label="Sair"
            >
              <LogOut size={17} />
              <span className="hidden sm:inline">
                {isPending ? "Saindo..." : "Sair"}
              </span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
