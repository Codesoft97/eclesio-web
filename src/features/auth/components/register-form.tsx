"use client";

import { Check, Church } from "lucide-react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordField } from "@/components/ui/password-field";
import { getApiErrorMessage } from "@/lib/api";
import { formatBrazilianPhone, getPhoneDigits } from "@/lib/formatters/phone";

import { useAuth } from "../auth-provider";
import { register } from "../auth-service";
import { getHomePathForRole } from "../role-redirect";

const signupBenefits = [
  "Escalas com convite pelo WhatsApp",
  "Cadastro em menos de 1 minuto",
  "Teste gratuito para organizar a rotina",
];

export function RegisterForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    password: "",
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateWhatsapp(value: string) {
    updateField("whatsapp", formatBrazilianPhone(value));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const session = await register({
          name: form.name,
          whatsapp: getPhoneDigits(form.whatsapp),
          password: form.password,
        });
        setSession(session);
        if (posthog.__loaded) {
          posthog.capture("church_registered", {
            church_id: session.church.id,
            user_role: session.user.role,
          });
        }
        router.push(getHomePathForRole(session.user.role));
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm"
    >
      <Field
        label="Seu nome"
        value={form.name}
        onChange={(event) => updateField("name", event.target.value)}
        placeholder="Maria Silva"
        autoComplete="name"
        required
      />
      <Field
        label="WhatsApp"
        value={form.whatsapp}
        onChange={(event) => updateWhatsapp(event.target.value)}
        placeholder="(11) 99999-9999"
        autoComplete="tel"
        inputMode="tel"
        maxLength={15}
        required
      />
      <PasswordField
        label="Senha"
        value={form.password}
        onChange={(event) => updateField("password", event.target.value)}
        placeholder="Minimo 8 caracteres"
        autoComplete="new-password"
        required
      />
      <div className="grid gap-2 rounded-lg border border-accent/20 bg-accent/5 p-3 text-xs font-medium text-foreground sm:grid-cols-3">
        {signupBenefits.map((benefit) => (
          <span key={benefit} className="flex items-start gap-2 leading-5">
            <Check size={14} className="mt-0.5 shrink-0 text-accent" />
            {benefit}
          </span>
        ))}
      </div>
      {error ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        <Church size={17} />
        {isPending ? "Criando acesso..." : "Comecar teste gratis"}
      </Button>
    </form>
  );
}
