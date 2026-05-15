"use client";

import { CheckCircle2, Loader2, LogOut, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { acceptLegalDocuments, logout } from "@/features/auth/auth-service";
import { useAuth } from "@/features/auth/auth-provider";
import type { AuthSession } from "@/features/auth/auth-types";
import { getHomePathForRole } from "@/features/auth/role-redirect";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";

export function needsLegalAcceptance(session: AuthSession | null) {
  if (!session) {
    return false;
  }

  return session.legalAcceptance?.requiresAcceptance !== false;
}

export function LegalAcceptancePage() {
  const router = useRouter();
  const { session, setSession, clearSession } = useAuth();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const currentTermsVersion =
    session?.legalAcceptance?.currentTermsVersion ?? "atual";
  const currentPrivacyPolicyVersion =
    session?.legalAcceptance?.currentPrivacyPolicyVersion ?? "atual";

  function handleAccept() {
    setError(null);

    if (!acceptedTerms || !acceptedPrivacyPolicy) {
      setError(
        "Marque os dois campos para confirmar o aceite dos documentos legais.",
      );
      return;
    }

    startTransition(async () => {
      try {
        const nextSession = await acceptLegalDocuments();
        setSession(nextSession);
        router.replace(getHomePathForRole(nextSession.user.role));
      } catch (err) {
        if (isUnauthorizedApiError(err)) {
          clearSession();
          router.replace("/login");
          return;
        }

        setError(getApiErrorMessage(err));
      }
    });
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

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col">
        <header className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-foreground shadow-xs transition-all duration-200 hover:border-danger/40 hover:text-danger hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Sair"
              title="Sair"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <section className="grid flex-1 place-items-center py-10">
          <div className="w-full max-w-2xl animate-slide-up rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            <div className="mb-6 border-b border-border pb-5">
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <ShieldCheck size={22} />
              </span>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                Documentos legais
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
                Confirme o aceite para continuar
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted">
                Atualizamos a formalização dos Termos de Uso e da Política de
                Privacidade. Para proteger a igreja, membros e obreiros, registre
                seu aceite antes de seguir usando o sistema.
              </p>
            </div>

            <div className="grid gap-3 rounded-lg border border-border bg-surface-subtle p-4 text-sm text-muted">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  className="mt-1 h-4 w-4 shrink-0 accent-yellow-500"
                />
                <span>
                  Li e aceito os{" "}
                  <Link
                    href="/termos-de-uso"
                    target="_blank"
                    className="font-semibold text-foreground underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
                  >
                    Termos de Uso
                  </Link>{" "}
                  versão {currentTermsVersion}.
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptedPrivacyPolicy}
                  onChange={(event) =>
                    setAcceptedPrivacyPolicy(event.target.checked)
                  }
                  className="mt-1 h-4 w-4 shrink-0 accent-yellow-500"
                />
                <span>
                  Li e aceito a{" "}
                  <Link
                    href="/politica-de-privacidade"
                    target="_blank"
                    className="font-semibold text-foreground underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
                  >
                    Política de Privacidade
                  </Link>{" "}
                  versão {currentPrivacyPolicyVersion}.
                </span>
              </label>
            </div>

            {error ? (
              <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={handleAccept}
                disabled={isPending}
                className="sm:flex-1"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                {isPending ? "Registrando..." : "Aceitar e continuar"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="sm:w-auto"
              >
                <LogOut size={17} />
                Sair
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
