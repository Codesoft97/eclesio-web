"use client";

import {
  BarChart3,
  CalendarDays,
  Church,
  HandCoins,
  Home,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/auth-service";
import { useAuth } from "@/features/auth/auth-provider";

const navItems = [
  { href: "/app", label: "Inicio", icon: Home },
  { href: "/app/membros", label: "Membros", icon: Users },
  { href: "/app/obreiros", label: "Obreiros", icon: UserCog },
  { href: "/app/financeiro", label: "Financeiro", icon: HandCoins },
  { href: "/app/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/app/relatorios", label: "Relatorios", icon: BarChart3 },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({ isCollapsed, onToggleCollapse }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, clearSession } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleLogout() {
    setError(null);

    startTransition(async () => {
      try {
        await logout();
      } finally {
        clearSession();
        router.push("/login");
      }
    });
  }

  return (
    <aside
      className={`flex min-h-screen w-full flex-col border-r border-border bg-surface py-5 transition-all duration-300 ${
        isCollapsed ? "px-3" : "px-4"
      }`}
    >
      <div
        className={`flex border-b border-border pb-5 ${
          isCollapsed ? "flex-col items-center gap-3" : "items-start gap-3"
        }`}
      >
        <LogoMark />
        {isCollapsed ? null : (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {session?.church.name ?? "Igreja"}
            </p>
            <p className="truncate text-xs text-muted">
              {session?.user.name ?? "Representante"}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="flex h-10 w-10 cursor-pointer items-center justify-center border border-border text-muted transition hover:border-accent hover:text-foreground"
          aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
        </button>
      </div>

      {isCollapsed ? null : (
        <div className="mt-4 border border-border bg-surface-subtle p-3 text-xs text-muted">
          <div className="mb-2 flex items-center gap-2 text-foreground">
            <Church size={14} />
            <span className="font-semibold">Conta ativa</span>
          </div>
          <p className="truncate">{session?.user.email ?? "Aguardando sessao"}</p>
        </div>
      )}

      <nav className="mt-6 grid gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={isCollapsed ? item.label : undefined}
              className={`flex h-11 items-center border text-sm font-medium transition ${
                isCollapsed ? "justify-center px-0" : "gap-3 px-3"
              } ${
                isActive
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-transparent text-muted hover:border-border hover:bg-surface-subtle hover:text-foreground"
              }`}
            >
              <Icon size={17} />
              {isCollapsed ? null : item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        {error && !isCollapsed ? (
          <p className="mb-3 text-xs text-danger">{error}</p>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-start"}`}
          onClick={handleLogout}
          disabled={isPending}
          aria-label="Sair"
          title={isCollapsed ? "Sair" : undefined}
        >
          <LogOut size={17} />
          {isCollapsed ? null : isPending ? "Saindo..." : "Sair"}
        </Button>
      </div>
    </aside>
  );
}
