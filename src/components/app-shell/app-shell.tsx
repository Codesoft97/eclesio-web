"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

import { AppMobileHeader } from "@/components/app-shell/app-mobile-header";
import { AppMobileNav } from "@/components/app-shell/app-mobile-nav";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AUTH_STORAGE_KEY, useAuth } from "@/features/auth/auth-provider";
import type { UserRole } from "@/features/auth/auth-types";

const SIDEBAR_STORAGE_KEY = "gerencia-igreja.sidebar-collapsed";
const SIDEBAR_EVENT = "gerencia-igreja-sidebar-change";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(SIDEBAR_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SIDEBAR_EVENT, callback);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) ?? "false";
}

function getServerSnapshot() {
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session } = useAuth();
  const sidebarSnapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const isSidebarCollapsed = sidebarSnapshot === "true";

  function toggleSidebar() {
    setSidebarPreference(!isSidebarCollapsed);
  }

  useEffect(() => {
    if (session) {
      if (session.user.role === "MEMBER") {
        router.replace("/portal");
      }

      return;
    }

    const storedRole = readStoredRole();

    if (storedRole === "MEMBER") {
      router.replace("/portal");
      return;
    }

    if (!storedRole) {
      router.replace("/login");
    }
  }, [router, session]);

  if (!session || session.user.role !== "CHURCH_ADMIN") {
    return (
      <div className="grid min-h-screen place-items-center bg-background text-muted">
        <div className="flex items-center gap-2 text-sm">
          <Loader2 className="animate-spin text-accent" size={18} />
          Carregando acesso...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" data-ph-mask>
      <AppMobileHeader />
      <div
        className="grid min-h-screen transition-[grid-template-columns] duration-300 ease-in-out lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]"
        style={
          {
            "--sidebar-width": isSidebarCollapsed ? "5.5rem" : "17rem",
          } as React.CSSProperties
        }
      >
        <div className="hidden lg:block">
          <AppSidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
          />
        </div>
        <main className="min-w-0 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-8">
          <div className="mb-6 hidden justify-end lg:flex">
            <ThemeToggle />
          </div>
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
      </div>
      <AppMobileNav />
    </div>
  );
}
