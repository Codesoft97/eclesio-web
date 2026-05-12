"use client";

import { CheckCircle2, KeyRound, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordField } from "@/components/ui/password-field";
import { getApiErrorMessage } from "@/lib/api";

import {
  requestPasswordRecovery,
  resetPassword,
  verifyPasswordRecoveryCode,
} from "../auth-service";

type RecoveryStep = "email" | "code" | "password" | "success";

export function PasswordRecoveryForm() {
  const [step, setStep] = useState<RecoveryStep>("email");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState("");
  const [expiresInSeconds, setExpiresInSeconds] = useState<number | null>(null);
  const [form, setForm] = useState({
    email: "",
    code: "",
    password: "",
    passwordConfirmation: "",
  });

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateCode(value: string) {
    updateField("code", value.replace(/\D/g, "").slice(0, 6));
  }

  function handleRequestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await requestPasswordRecovery({ email: form.email });
        setMessage(response.message);
        setStep("code");
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    });
  }

  function handleVerifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await verifyPasswordRecoveryCode({
          email: form.email,
          code: form.code,
        });
        setResetToken(response.resetToken);
        setExpiresInSeconds(response.expiresInSeconds);
        setStep("password");
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    });
  }

  function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const response = await resetPassword({
          email: form.email,
          resetToken,
          password: form.password,
          passwordConfirmation: form.passwordConfirmation,
        });
        setMessage(response.message);
        setStep("success");
        setResetToken("");
        setForm((current) => ({
          ...current,
          code: "",
          password: "",
          passwordConfirmation: "",
        }));
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    });
  }

  function goBackToEmailStep() {
    setStep("email");
    setError(null);
    setMessage(null);
    setResetToken("");
    setExpiresInSeconds(null);
  }

  if (step === "success") {
    return (
      <div className="grid gap-5 rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 p-4 text-sm text-foreground">
          <CheckCircle2 className="mt-0.5 shrink-0 text-accent" size={20} />
          <div>
            <p className="font-semibold">Senha redefinida</p>
            <p className="mt-1 text-muted">
              {message ??
                "Sua senha foi atualizada. Agora você já pode entrar novamente."}
            </p>
          </div>
        </div>
        <Link
          href="/login"
          className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-accent bg-accent px-4 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:bg-yellow-400"
        >
          Entrar com nova senha
        </Link>
      </div>
    );
  }

  if (step === "password") {
    return (
      <form
        onSubmit={handleResetPassword}
        className="grid gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm"
        data-ph-mask
      >
        <div className="rounded-lg border border-border bg-background p-3 text-sm text-muted">
          Código validado. Escolha uma nova senha forte para proteger o acesso.
          {expiresInSeconds
            ? ` Este acesso expira em ${Math.ceil(expiresInSeconds / 60)} minutos.`
            : null}
        </div>
        <Field
          label="Nova senha"
          type="password"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="Mínimo 8 caracteres"
          autoComplete="new-password"
          required
        />
        <PasswordField
          label="Confirmar nova senha"
          value={form.passwordConfirmation}
          onChange={(event) =>
            updateField("passwordConfirmation", event.target.value)
          }
          placeholder="Repita a nova senha"
          autoComplete="new-password"
          required
        />
        {error ? (
          <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={isPending || !resetToken}>
          <KeyRound size={17} />
          {isPending ? "Redefinindo..." : "Redefinir senha"}
        </Button>
      </form>
    );
  }

  if (step === "code") {
    return (
      <form
        onSubmit={handleVerifyCode}
        className="grid gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm"
        data-ph-mask
      >
        {message ? (
          <p className="rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-foreground">
            {message}
          </p>
        ) : null}
        <Field
          label="Código recebido por email"
          value={form.code}
          onChange={(event) => updateCode(event.target.value)}
          placeholder="123456"
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          required
        />
        <button
          type="button"
          onClick={goBackToEmailStep}
          className="w-fit cursor-pointer text-sm font-semibold text-foreground underline decoration-accent underline-offset-4"
        >
          Usar outro email
        </button>
        {error ? (
          <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={isPending || form.code.length !== 6}>
          <ShieldCheck size={17} />
          {isPending ? "Validando..." : "Validar código"}
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleRequestCode}
      className="grid gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm"
      data-ph-mask
    >
      <Field
        label="Email de acesso"
        type="email"
        value={form.email}
        onChange={(event) => updateField("email", event.target.value)}
        placeholder="representante@igreja.com"
        autoComplete="email"
        required
      />
      <p className="text-xs leading-5 text-muted">
        Se esse email estiver cadastrado, enviaremos um código de validação para
        continuar a redefinição.
      </p>
      {error ? (
        <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        <Mail size={17} />
        {isPending ? "Enviando..." : "Enviar código"}
      </Button>
    </form>
  );
}
