"use client";

import { FormEvent, useState } from "react";
import { Save, UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  formatBrazilianPhone,
  getPhoneDigits,
} from "@/lib/formatters/phone";

import type { Member, MemberPayload } from "../member-types";

type MemberFormMode = "create" | "edit";

interface MemberFormModalProps {
  mode: MemberFormMode;
  member: Member | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: MemberPayload) => void;
}

export function MemberFormModal({
  mode,
  member,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: MemberFormModalProps) {
  const [form, setForm] = useState(() => ({
    name: member?.name ?? "",
    whatsapp: member ? formatBrazilianPhone(member.whatsapp) : "",
  }));
  const [localError, setLocalError] = useState<string | null>(null);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateWhatsapp(value: string) {
    updateField("whatsapp", formatBrazilianPhone(value));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const payload = {
      name: form.name.trim().replace(/\s+/g, " "),
      whatsapp: getPhoneDigits(form.whatsapp),
    };

    if (payload.name.length < 2) {
      setLocalError("Informe um nome com pelo menos 2 caracteres.");
      return;
    }

    if (payload.whatsapp.length < 10) {
      setLocalError("Informe um WhatsApp valido.");
      return;
    }

    onSubmit(payload);
  }

  const title = mode === "create" ? "Novo membro" : "Editar membro";
  const subtitle =
    mode === "create"
      ? "Cadastre os primeiros dados do membro da igreja."
      : "Atualize as informacoes principais deste membro.";
  const submitLabel =
    mode === "create" ? "Cadastrar membro" : "Salvar alteracoes";
  const Icon = mode === "create" ? UserPlus : Save;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-foreground/25 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-modal-title"
        className="w-full max-w-lg border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Membros
            </p>
            <h2
              id="member-modal-title"
              className="mt-2 text-2xl font-semibold text-foreground"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border border-border text-muted transition hover:border-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Fechar modal"
            disabled={isSubmitting}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 p-5">
          <Field
            label="Nome"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Joao Silva"
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

          {localError || error ? (
            <p className="border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              {localError ?? error}
            </p>
          ) : null}

          <div className="grid gap-3 pt-2 sm:grid-cols-[1fr_auto]">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Icon size={17} />
              {isSubmitting ? "Salvando..." : submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

