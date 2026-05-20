"use client";

import { CreditCard, Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, useTransition } from "react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { AUTH_STORAGE_KEY, useAuth } from "@/features/auth/auth-provider";
import { logout } from "@/features/auth/auth-service";
import type { UserRole } from "@/features/auth/auth-types";
import {
  LegalAcceptancePage,
  needsLegalAcceptance,
} from "@/features/legal/components/legal-acceptance-page";

import { MemberPortalMobileHeader } from "./member-portal-mobile-header";
import { MemberPortalMobileNav } from "./member-portal-mobile-nav";
import { MemberPortalSidebar } from "./member-portal-sidebar";

const SIDEBAR_STORAGE_KEY = "gerencia-igreja.member-sidebar-collapsed";
const SIDEBAR_EVENT = "gerencia-igreja-member-sidebar-change";

function subscribeSidebar(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SIDEBAR_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SIDEBAR_EVENT, callback);
  };
}

function getSidebarSnapshot() {
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) ?? "false";
}

function getServerSidebarSnapshot() {
  return "false";
}

function setSidebarPreference(isCollapsed: boolean) {
  window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
  window.dispatchEvent(new Event(SIDEBAR_EVENT));
}

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
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const sidebarSnapshot = useSyncExternalStore(
    subscribeSidebar,
    getSidebarSnapshot,
    getServerSidebarSnapshot,
  );
  const isSidebarCollapsed = sidebarSnapshot === "true";

  function toggleSidebar() {
    setSidebarPreference(!isSidebarCollapsed);
  }

  function handleLogout() {
    startLogoutTransition(async () => {
      try {
        await logout();
      } finally {
        clearSession();
        router.replace("/login");
      }
    });
  }

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

  if (needsLegalAcceptance(session)) {
    return <LegalAcceptancePage />;
  }

  if (session.subscription?.requiresPayment) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col">
          <header className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                type="button"
                variant="ghost"
                onClick={handleLogout}
                disabled={isLoggingOut}
                aria-label="Sair"
              >
                <LogOut size={17} />
                Sair
              </Button>
            </div>
          </header>

          <section className="grid flex-1 place-items-center py-10">
            <div className="w-full max-w-xl rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
              <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-subtle text-foreground">
                <CreditCard size={24} />
              </span>
              <p className="font-mono text-xs uppercase text-muted">
                Portal da igreja
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-foreground">
                Acesso temporariamente indisponivel
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted">
                A igreja precisa regularizar a assinatura para liberar o portal
                dos membros novamente. O administrador consegue fazer isso na
                tela de assinatura.
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground lg:h-screen lg:overflow-hidden"
      data-ph-mask
    >
      <MemberPortalMobileHeader />
      <div
        className="grid min-h-screen transition-[grid-template-columns] duration-300 ease-in-out lg:h-screen lg:min-h-0 lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]"
        style={
          {
            "--sidebar-width": isSidebarCollapsed ? "5.5rem" : "17rem",
          } as React.CSSProperties
        }
      >
        <div className="hidden lg:block">
          <MemberPortalSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
          />
        </div>
        <main className="min-w-0 px-4 pb-24 pt-5 sm:px-6 lg:h-screen lg:overflow-y-auto lg:px-8 lg:pb-8">
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
