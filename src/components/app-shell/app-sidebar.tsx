"use client";

import {
  BarChart3,
  CalendarDays,
  Church,
  HandCoins,
  Home,
  LogOut,
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
  { href: "/app/dizimos", label: "Dizimos", icon: HandCoins },
  { href: "/app/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/app/relatorios", label: "Relatorios", icon: BarChart3 },
];

export function AppSidebar() {
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
    <aside className="flex min-h-screen w-full flex-col border-r border-border bg-surface px-4 py-5 lg:w-72">
      <div className="flex items-start gap-3 border-b border-border pb-5">
        <LogoMark />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {session?.church.name ?? "Igreja"}
          </p>
          <p className="truncate text-xs text-muted">{session?.user.name ?? "Representante"}</p>
        </div>
      </div>

      <div className="mt-4 border border-border bg-surface-subtle p-3 text-xs text-muted">
        <div className="mb-2 flex items-center gap-2 text-foreground">
          <Church size={14} />
          <span className="font-semibold">Conta ativa</span>
        </div>
        <p className="truncate">{session?.user.email ?? "Aguardando sessao"}</p>
      </div>

      <nav className="mt-6 grid gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-11 items-center gap-3 border px-3 text-sm font-medium transition ${
                isActive
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-transparent text-muted hover:border-border hover:bg-surface-subtle hover:text-foreground"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        {error ? <p className="mb-3 text-xs text-danger">{error}</p> : null}
        <Button type="button" variant="ghost" className="w-full justify-start" onClick={handleLogout} disabled={isPending}>
          <LogOut size={17} />
          {isPending ? "Saindo..." : "Sair"}
        </Button>
      </div>
    </aside>
  );
}