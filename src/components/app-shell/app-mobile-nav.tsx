"use client";

import {
  BarChart3,
  CalendarDays,
  HandCoins,
  Home,
  Megaphone,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/app", label: "Início", icon: Home },
  { href: "/app/membros", label: "Membros", icon: Users },
  { href: "/app/obreiros", label: "Obreiros", icon: UserCog },
  { href: "/app/financeiro", label: "Financeiro", icon: HandCoins },
  { href: "/app/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/app/comunicados", label: "Comunicados", icon: Megaphone },
  { href: "/app/relatorios", label: "Relatórios", icon: BarChart3 },
];

export function AppMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex overflow-x-auto border-t border-border bg-surface/90 backdrop-blur-xl lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-16 min-w-20 flex-1 flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-all duration-200 sm:text-[11px] ${
              isActive
                ? "text-accent"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span className={`flex items-center justify-center rounded-lg p-1.5 transition-all duration-200 ${
              isActive ? "bg-accent/15" : ""
            }`}>
              <Icon size={18} />
            </span>
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
