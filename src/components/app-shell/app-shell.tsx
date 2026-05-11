"use client";

import { useSyncExternalStore } from "react";

import { AppMobileHeader } from "@/components/app-shell/app-mobile-header";
import { AppMobileNav } from "@/components/app-shell/app-mobile-nav";
import { AppSidebar } from "@/components/app-shell/app-sidebar";
import { ThemeToggle } from "@/components/theme/theme-toggle";

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

export function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarSnapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const isSidebarCollapsed = sidebarSnapshot === "true";

  function toggleSidebar() {
    setSidebarPreference(!isSidebarCollapsed);
  }

  return (
    <div className="min-h-screen bg-background text-foreground" data-ph-mask>
      <AppMobileHeader />
      <div
        className="grid min-h-screen transition-[grid-template-columns] duration-300 lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)]"
        style={
          {
            "--sidebar-width": isSidebarCollapsed ? "5.5rem" : "18rem",
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
          {children}
        </main>
      </div>
      <AppMobileNav />
    </div>
  );
}
