"use client";

import { CheckCircle2, Loader2, RefreshCw, Save, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useAuth } from "@/features/auth/auth-provider";
import { updateCurrentAccount } from "@/features/auth/auth-service";
import type { AuthSession } from "@/features/auth/auth-types";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";
import { formatBrazilianPhone, getPhoneDigits } from "@/lib/formatters/phone";

function isGeneratedSignupEmail(email: string | undefined) {
  return Boolean(email?.endsWith("@gerenciaigreja.local"));
}

function getInitialForm(session: AuthSession) {
  return {
    name: session.user.name,
    churchName: session.church.name,
    email: isGeneratedSignupEmail(session.user.email) ? "" : session.user.email,
    whatsapp: formatBrazilianPhone(session.user.whatsapp),
  };
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function AccountProfilePageClient() {
  const router = useRouter();
  const { session, setSession, clearSession } = useAuth();
  const [form, setForm] = useState(() =>
    session
      ? getInitialForm(session)
      : { name: "", churchName: "", email: "", whatsapp: "" },
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const needsEmailCompletion = isGeneratedSignupEmail(session?.user.email);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    if (session) {
      setForm(getInitialForm(session));
      setError(null);
      setSuccess(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      name: normalizeName(form.name),
      churchName: normalizeName(form.churchName),
      email: form.email.trim().toLowerCase(),
      whatsapp: getPhoneDigits(form.whatsapp),
    };

    if (payload.name.length < 2) {
      setError("Informe seu nome com pelo menos 2 caracteres.");
      return;
    }

    if (payload.churchName.length < 2) {
      setError("Informe o nome da igreja com pelo menos 2 caracteres.");
      return;
    }

    if (payload.email && !payload.email.includes("@")) {
      setError("Informe um email valido.");
      return;
    }

    if (payload.whatsapp.length < 10) {
      setError("Informe um WhatsApp valido.");
      return;
    }

    startSaving(async () => {
      try {
        const nextSession = await updateCurrentAccount({
          name: payload.name,
          churchName: payload.churchName,
          email: payload.email || undefined,
          whatsapp: payload.whatsapp,
        });

        setSession(nextSession);
        setForm(getInitialForm(nextSession));
        setSuccess("Dados atualizados.");
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

  if (!session) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-muted">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin text-accent" size={18} />
          Carregando perfil...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Conta
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Meu perfil
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Atualize os dados do representante e da igreja sempre que precisar.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={resetForm}
          disabled={isSaving}
        >
          <RefreshCw size={16} />
          Restaurar dados
        </Button>
      </div>

      {needsEmailCompletion ? (
        <section className="mb-5 rounded-xl border border-accent/40 bg-accent/10 p-5 shadow-sm">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Complete seu email
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                Seu cadastro foi criado de forma rapida. Informe um email real
                para recuperação de senha e comunicações importantes da conta.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 flex items-start gap-3 border-b border-border pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
            <UserRound size={18} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Dados cadastrais
            </h2>
            <p className="text-sm leading-6 text-muted">
              Esses dados identificam a igreja e o usuario administrador.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Seu nome"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              autoComplete="name"
              required
            />
            <Field
              label="Nome da igreja"
              value={form.churchName}
              onChange={(event) =>
                updateField("churchName", event.target.value)
              }
              required
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="voce@email.com"
              autoComplete="email"
            />
            <Field
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(event) =>
                updateField("whatsapp", formatBrazilianPhone(event.target.value))
              }
              placeholder="(11) 99999-9999"
              autoComplete="tel"
              inputMode="tel"
              maxLength={15}
              required
            />
          </div>

          {error || success ? (
            <p
              className={`rounded-lg border p-3 text-sm ${
                error
                  ? "border-danger/30 bg-danger/10 text-danger"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {error ?? success}
            </p>
          ) : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Save size={17} />
              )}
              {isSaving ? "Salvando..." : "Salvar alteracoes"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
