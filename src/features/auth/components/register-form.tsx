"use client";

import { Church } from "lucide-react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { getApiErrorMessage } from "@/lib/api";
import {
  formatBrazilianPhone,
  getPhoneDigits,
} from "@/lib/formatters/phone";

import { register } from "../auth-service";
import { useAuth } from "../auth-provider";

export function RegisterForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    churchName: "",
    representativeName: "",
    email: "",
    whatsapp: "",
    password: "",
    passwordConfirmation: "",
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
          ...form,
          whatsapp: getPhoneDigits(form.whatsapp),
        });
        setSession(session);
        if (posthog.__loaded) {
          posthog.capture("church_registered", {
            church_id: session.church.id,
            user_role: session.user.role,
          });
        }
        router.push("/app");
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 border border-border bg-surface p-5 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Nome da igreja"
          value={form.churchName}
          onChange={(event) => updateField("churchName", event.target.value)}
          placeholder="Igreja Central"
          required
        />
        <Field
          label="Representante"
          value={form.representativeName}
          onChange={(event) =>
            updateField("representativeName", event.target.value)
          }
          placeholder="Maria Silva"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="representante@igreja.com"
          autoComplete="email"
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
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Senha"
          type="password"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="Minimo 8 caracteres"
          autoComplete="new-password"
          required
        />
        <Field
          label="Confirmar senha"
          type="password"
          value={form.passwordConfirmation}
          onChange={(event) =>
            updateField("passwordConfirmation", event.target.value)
          }
          placeholder="Repita a senha"
          autoComplete="new-password"
          required
        />
      </div>
      {error ? (
        <p className="border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        <Church size={17} />
        {isPending ? "Cadastrando..." : "Cadastrar igreja"}
      </Button>
    </form>
  );
}