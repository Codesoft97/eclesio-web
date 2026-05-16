"use client";

import {
  BarChart3,
  CalendarDays,
  Church,
  CreditCard,
  HandCoins,
  HeartHandshake,
  Home,
  LogOut,
  Megaphone,
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
  { href: "/app", label: "Início", icon: Home },
  { href: "/app/membros", label: "Membros", icon: Users },
  { href: "/app/obreiros", label: "Obreiros", icon: UserCog },
  { href: "/app/financeiro", label: "Financeiro", icon: HandCoins },
  { href: "/app/doacoes", label: "Doações", icon: HeartHandshake },
  { href: "/app/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/app/comunicados", label: "Comunicados", icon: Megaphone },
  { href: "/app/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/app/assinatura", label: "Assinatura", icon: CreditCard },
];

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
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
      className={`flex h-screen w-full flex-col overflow-hidden border-r border-border bg-surface/80 py-5 backdrop-blur-xl transition-all duration-300 ${
        isCollapsed ? "px-3" : "px-4"
      }`}
    >
      <div
        className={`flex shrink-0 border-b border-border pb-5 ${
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
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border text-muted transition-all duration-200 hover:border-accent hover:text-foreground"
          aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {isCollapsed ? null : (
        <div className="mt-4 flex shrink-0 items-center gap-3 rounded-lg border border-border bg-surface-subtle p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
            {getInitials(session?.user.name ?? "U")}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-foreground">
              <Church size={12} />
              <span className="font-semibold">Conta ativa</span>
            </div>
            <p className="truncate text-xs text-muted">{session?.user.email ?? "Aguardando sessão"}</p>
          </div>
        </div>
      )}

      <nav
        className={`mt-6 grid min-h-0 flex-1 content-start gap-1 overflow-y-auto ${
          isCollapsed ? "" : "pr-1"
        }`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/app" && pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={isCollapsed ? item.label : undefined}
              className={`flex h-11 items-center rounded-lg border text-sm font-medium transition-all duration-200 ${
                isCollapsed ? "justify-center px-0" : "gap-3 px-3"
              } ${
                isActive
                  ? "border-accent/30 bg-accent text-accent-foreground shadow-sm"
                  : "border-transparent text-muted hover:bg-surface-subtle hover:text-foreground"
              }`}
            >
              <Icon size={17} />
              {isCollapsed ? null : item.label}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 pt-6">
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
