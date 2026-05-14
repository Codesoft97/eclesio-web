"use client";

import { Church, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { logout } from "@/features/auth/auth-service";
import { useAuth } from "@/features/auth/auth-provider";

import { memberPortalNavItems } from "./member-portal-nav";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function MemberPortalSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, clearSession } = useAuth();
  const [isPending, startTransition] = useTransition();

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

  return (
    <aside className="flex min-h-screen w-full flex-col border-r border-border bg-surface/80 px-4 py-5 backdrop-blur-xl">
      <div className="flex items-start gap-3 border-b border-border pb-5">
        <LogoMark />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {session?.church.name ?? "Igreja"}
          </p>
          <p className="truncate text-xs text-muted">Portal do membro</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-surface-subtle p-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
          {getInitials(session?.user.name ?? "M")}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-foreground">
            <Church size={12} />
            <span className="font-semibold">Acesso de membro</span>
          </div>
          <p className="truncate text-xs text-muted">
            {session?.user.email ?? "Sessao ativa"}
          </p>
        </div>
      </div>

      <nav className="mt-6 grid gap-1">
        {memberPortalNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex h-11 items-center gap-3 rounded-lg border px-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "border-accent/30 bg-accent text-accent-foreground shadow-sm"
                  : "border-transparent text-muted hover:bg-surface-subtle hover:text-foreground"
              }`}
            >
              <Icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
          disabled={isPending}
        >
          <LogOut size={17} />
          {isPending ? "Saindo..." : "Sair"}
        </Button>
      </div>
    </aside>
  );
}
