"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { logout } from "@/features/auth/auth-service";
import { useAuth } from "@/features/auth/auth-provider";

export function LogoutIconButton() {
  const router = useRouter();
  const { clearSession } = useAuth();
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
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-foreground shadow-xs transition-all duration-200 hover:border-danger/40 hover:text-danger hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
      aria-label={isPending ? "Saindo" : "Sair"}
      title="Sair"
    >
      <LogOut size={17} aria-hidden="true" />
    </button>
  );
}
