"use client";

import { CheckCircle2, Church, Loader2, LogIn, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState, useTransition } from "react";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordField } from "@/components/ui/password-field";
import { getApiErrorMessage } from "@/lib/api";

import {
  acceptMemberAccessInvitation,
  getMemberAccessInvitation,
} from "../member-access-service";
import type { MemberAccessInvitationPreview } from "../member-access-types";

interface MemberInvitationPageClientProps {
  token: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function MemberInvitationPageClient({
  token,
}: MemberInvitationPageClientProps) {
  const [preview, setPreview] =
    useState<MemberAccessInvitationPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isActivated, setIsActivated] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  useEffect(() => {
    let ignore = false;

    async function loadInvitation() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await getMemberAccessInvitation(token);

        if (!ignore) {
          setPreview(data);
          setForm((current) => ({ ...current, email: data.email ?? "" }));
        }
      } catch (err) {
        if (!ignore) {
          setLoadError(getApiErrorMessage(err));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadInvitation();

    return () => {
      ignore = true;
    };
  }, [token]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      token,
      email: form.email.trim().toLowerCase(),
      password: form.password,
      passwordConfirmation: form.passwordConfirmation,
    };

    if (!payload.email.includes("@")) {
      setError("Informe um email valido.");
      return;
    }

    startTransition(async () => {
      try {
        await acceptMemberAccessInvitation(payload);
        setIsActivated(true);
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    });
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col">
        <header className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </header>

        <section className="grid flex-1 place-items-center py-10">
          <div className="w-full max-w-xl animate-slide-up rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6">
            {isLoading ? (
              <div className="grid min-h-72 place-items-center text-center text-sm text-muted">
                <div>
                  <Loader2
                    className="mx-auto mb-3 animate-spin text-accent"
                    size={28}
                  />
                  Carregando convite...
                </div>
              </div>
            ) : loadError || !preview ? (
              <div className="grid min-h-72 place-items-center text-center">
                <div className="max-w-sm">
                  <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-danger/30 bg-danger/10 text-danger">
                    <ShieldAlert size={26} />
                  </span>
                  <h1 className="text-xl font-semibold text-foreground">
                    Convite indisponivel
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {loadError ??
                      "Solicite um novo convite para o administrador da igreja."}
                  </p>
                </div>
              </div>
            ) : isActivated ? (
              <div className="grid min-h-72 place-items-center text-center">
                <div className="max-w-sm">
                  <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 size={28} />
                  </span>
                  <h1 className="text-xl font-semibold text-foreground">
                    Acesso ativado
                  </h1>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Sua senha foi criada. Agora voce pode entrar no portal da
                    igreja com seu email.
                  </p>
                  <Link
                    href="/login"
                    className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-accent bg-accent px-4 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:bg-yellow-400"
                  >
                    <LogIn size={17} />
                    Entrar no portal
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 border-b border-border pb-5">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                    Convite de membro
                  </p>
                  <h1 className="mt-3 text-2xl font-semibold text-foreground">
                    Ative seu acesso
                  </h1>
                  <div className="mt-4 rounded-lg border border-border bg-surface-subtle p-4 text-sm">
                    <div className="flex items-start gap-3">
                      <Church size={18} className="mt-0.5 text-accent" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {preview.churchName}
                        </p>
                        <p className="mt-1 text-muted">
                          Convite para {preview.memberName}. Expira em{" "}
                          {formatDate(preview.expiresAt)}.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-4">
                  <Field
                    label="Email"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    placeholder="seuemail@exemplo.com"
                    autoComplete="email"
                    required
                  />
                  <PasswordField
                    label="Senha"
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    placeholder="Minimo 8 caracteres"
                    autoComplete="new-password"
                    required
                  />
                  <PasswordField
                    label="Confirmar senha"
                    value={form.passwordConfirmation}
                    onChange={(event) =>
                      updateField("passwordConfirmation", event.target.value)
                    }
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    required
                  />

                  {error ? (
                    <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                      {error}
                    </p>
                  ) : null}

                  <Button type="submit" disabled={isPending}>
                    {isPending ? (
                      <Loader2 className="animate-spin" size={17} />
                    ) : (
                      <CheckCircle2 size={17} />
                    )}
                    {isPending ? "Ativando..." : "Ativar acesso"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
