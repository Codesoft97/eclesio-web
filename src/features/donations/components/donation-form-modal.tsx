"use client";

import { FormEvent, useState } from "react";
import { HeartHandshake, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

import type {
  DonationCampaign,
  DonationCampaignPayload,
} from "../donation-types";

type DonationFormMode = "create" | "edit";

interface DonationFormModalProps {
  mode: DonationFormMode;
  campaign: DonationCampaign | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: DonationCampaignPayload) => void;
}

export function DonationFormModal({
  mode,
  campaign,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: DonationFormModalProps) {
  const [form, setForm] = useState(() => ({
    title: campaign?.title ?? "",
    description: campaign?.description ?? "",
    pixKey: campaign?.pixKey ?? "",
    receiverName: campaign?.receiverName ?? "",
    receiverCity: campaign?.receiverCity ?? "",
    isActive: campaign?.isActive ?? true,
  }));
  const [localError, setLocalError] = useState<string | null>(null);

  function updateField<FieldName extends keyof typeof form>(
    field: FieldName,
    value: (typeof form)[FieldName],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const payload = {
      title: form.title.trim().replace(/\s+/g, " "),
      description: form.description.trim() || undefined,
      pixKey: form.pixKey.trim(),
      receiverName: form.receiverName.trim().replace(/\s+/g, " ") || undefined,
      receiverCity: form.receiverCity.trim().replace(/\s+/g, " ") || undefined,
      isActive: form.isActive,
    };

    if (payload.title.length < 3) {
      setLocalError("Informe um titulo com pelo menos 3 caracteres.");
      return;
    }

    if (payload.pixKey.length === 0) {
      setLocalError("Informe a chave Pix deste objetivo.");
      return;
    }

    onSubmit(payload);
  }

  const title = mode === "create" ? "Novo objetivo" : "Editar objetivo";
  const submitLabel = mode === "create" ? "Criar objetivo" : "Salvar";
  const Icon = mode === "create" ? HeartHandshake : Save;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 grid place-items-end bg-foreground/30 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-modal-title"
        className="animate-scale-in max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Doações
            </p>
            <h2
              id="donation-modal-title"
              className="mt-2 text-2xl font-semibold text-foreground"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Cadastre um destino de doação com chave Pix própria.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-muted transition-all duration-200 hover:border-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Fechar modal"
            disabled={isSubmitting}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 p-5">
          <Field
            label="Objetivo"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Doacao para Igreja"
            maxLength={120}
            required
          />

          <label className="grid gap-2 text-sm font-medium text-foreground">
            <span>Descricao</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Explique rapidamente para onde esta doacao sera direcionada."
              rows={4}
              maxLength={1000}
              className="min-h-28 rounded-lg border border-border bg-surface-subtle px-3.5 py-3 text-sm text-foreground shadow-xs transition-all duration-200 placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
            />
          </label>

          <Field
            label="Chave Pix"
            value={form.pixKey}
            onChange={(event) => updateField("pixKey", event.target.value)}
            placeholder="email, telefone, CPF/CNPJ ou chave aleatoria"
            maxLength={140}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Nome do recebedor"
              value={form.receiverName}
              onChange={(event) =>
                updateField("receiverName", event.target.value)
              }
              placeholder="Igreja Central"
              maxLength={25}
            />
            <Field
              label="Cidade do recebedor"
              value={form.receiverCity}
              onChange={(event) =>
                updateField("receiverCity", event.target.value)
              }
              placeholder="Sao Paulo"
              maxLength={15}
            />
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-border bg-surface-subtle p-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => updateField("isActive", event.target.checked)}
              className="mt-1 h-4 w-4 accent-accent"
            />
            <span>
              <span className="block font-semibold">Exibir no portal</span>
              <span className="text-xs leading-5 text-muted">
                Objetivos ativos aparecem para os membros fazerem doacoes.
              </span>
            </span>
          </label>

          {localError || error ? (
            <p className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
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
