"use client";

import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordField } from "@/components/ui/password-field";
import { getApiErrorMessage } from "@/lib/api";

import { login } from "../auth-service";
import { useAuth } from "../auth-provider";
import { getHomePathForRole } from "../role-redirect";

export function LoginForm() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const session = await login(form);
        setSession(session);
        if (posthog.__loaded) {
          posthog.capture("user_logged_in", {
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
        label="Email"
        type="email"
        value={form.email}
        onChange={(event) =>
          setForm((current) => ({ ...current, email: event.target.value }))
        }
        placeholder="email@exemplo.com"
        autoComplete="email"
        required
      />
      <PasswordField
        label="Senha"
        value={form.password}
        onChange={(event) =>
          setForm((current) => ({ ...current, password: event.target.value }))
        }
        placeholder="Sua senha"
        autoComplete="current-password"
        required
      />
      {error ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        <LogIn size={17} />
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
