"use client";

import { Loader2, RefreshCw, Save, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useAuth } from "@/features/auth/auth-provider";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";
import {
  formatBrazilianPhone,
  getPhoneDigits,
} from "@/lib/formatters/phone";

import {
  getMemberPortalProfile,
  updateMemberPortalProfile,
} from "../member-portal-service";
import type { MemberPortalProfile } from "../member-portal-types";

export function MemberPortalProfilePageClient() {
  const router = useRouter();
  const { session, setSession, clearSession } = useAuth();
  const [profile, setProfile] = useState<MemberPortalProfile | null>(null);
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSaving, startSaving] = useTransition();

  useEffect(() => {
    let ignore = false;

    async function loadProfile() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getMemberPortalProfile();

        if (!ignore) {
          setProfile(data);
          setForm({
            name: data.member.name,
            email: data.member.email ?? session?.user.email ?? "",
            whatsapp: formatBrazilianPhone(data.member.whatsapp),
          });
        }
      } catch (err) {
        if (isUnauthorizedApiError(err)) {
          clearSession();
          router.push("/login");
          return;
        }

        if (!ignore) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      ignore = true;
    };
  }, [clearSession, reloadKey, router, session?.user.email]);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleUnauthorized(err: unknown) {
    if (!isUnauthorizedApiError(err)) {
      return false;
    }

    clearSession();
    router.push("/login");
    return true;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const payload = {
      name: form.name.trim().replace(/\s+/g, " "),
      email: form.email.trim().toLowerCase(),
      whatsapp: getPhoneDigits(form.whatsapp),
    };

    if (payload.name.length < 2) {
      setError("Informe um nome com pelo menos 2 caracteres.");
      return;
    }

    if (!payload.email.includes("@")) {
      setError("Informe um email valido.");
      return;
    }

    if (payload.whatsapp.length < 10) {
      setError("Informe um WhatsApp valido.");
      return;
    }

    startSaving(async () => {
      try {
        const updatedProfile = await updateMemberPortalProfile(payload);
        setProfile(updatedProfile);
        setForm({
          name: updatedProfile.member.name,
          email: updatedProfile.member.email ?? payload.email,
          whatsapp: formatBrazilianPhone(updatedProfile.member.whatsapp),
        });

        if (session) {
          setSession({
            ...session,
            user: {
              ...session.user,
              name: updatedProfile.member.name,
              email: updatedProfile.member.email ?? session.user.email,
              whatsapp: updatedProfile.member.whatsapp,
            },
          });
        }

        setSuccess("Dados atualizados.");
      } catch (err) {
        if (await handleUnauthorized(err)) {
          return;
        }

        setError(getApiErrorMessage(err));
      }
    });
  }

  function refreshProfile() {
    setReloadKey((current) => current + 1);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Portal da igreja
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Meu perfil
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Atualize seus dados de contato e acompanhe seu vinculo como membro.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={refreshProfile}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <RefreshCw size={16} />
          )}
          Atualizar
        </Button>
      </div>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 flex items-start gap-3 border-b border-border pb-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
            <UserRound size={18} />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Dados pessoais
            </h2>
            <p className="text-sm leading-6 text-muted">
              Essas informacoes tambem atualizam seu acesso ao portal.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid min-h-64 place-items-center text-sm text-muted">
            <div>
              <Loader2 className="mx-auto mb-3 animate-spin text-accent" size={24} />
              Carregando perfil...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4">
            <Field
              label="Nome"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              autoComplete="name"
              required
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              autoComplete="email"
              required
            />
            <Field
              label="WhatsApp"
              value={form.whatsapp}
              onChange={(event) =>
                updateField("whatsapp", formatBrazilianPhone(event.target.value))
              }
              autoComplete="tel"
              inputMode="tel"
              maxLength={15}
              required
            />

            {profile?.worker ? (
              <div className="rounded-lg border border-border bg-surface-subtle p-3 text-sm">
                <p className="font-semibold text-foreground">
                  {profile.worker.ministry.name}
                </p>
                <p className="mt-1 text-muted">
                  Funcao: {profile.worker.role.name}
                </p>
              </div>
            ) : null}

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

            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Save size={17} />
              )}
              {isSaving ? "Salvando..." : "Salvar dados"}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}
