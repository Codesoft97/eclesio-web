"use client";

import { FormEvent, useState } from "react";
import { Save, UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  formatBrazilianPhone,
  getPhoneDigits,
} from "@/lib/formatters/phone";

import type {
  CreateWorkerPayload,
  UpdateWorkerPayload,
  Worker,
  WorkerMinistry,
} from "../worker-types";

type WorkerFormMode = "create" | "edit";

interface WorkerFormModalProps {
  mode: WorkerFormMode;
  worker: Worker | null;
  ministries: WorkerMinistry[];
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateWorkerPayload | UpdateWorkerPayload) => void;
}

function getFirstMinistryWithRole(ministries: WorkerMinistry[]) {
  return ministries.find((ministry) => ministry.roles.length > 0) ?? ministries[0];
}

export function WorkerFormModal({
  mode,
  worker,
  ministries,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: WorkerFormModalProps) {
  const firstMinistry = getFirstMinistryWithRole(ministries);
  const initialMinistryId = worker?.ministryId ?? firstMinistry?.id ?? "";
  const initialRoles =
    ministries.find((ministry) => ministry.id === initialMinistryId)?.roles ?? [];

  const [form, setForm] = useState(() => ({
    name: worker?.name ?? "",
    whatsapp: worker ? formatBrazilianPhone(worker.whatsapp) : "",
    ministryId: initialMinistryId,
    roleId: worker?.roleId ?? initialRoles[0]?.id ?? "",
  }));
  const [localError, setLocalError] = useState<string | null>(null);

  const selectedMinistry = ministries.find(
    (ministry) => ministry.id === form.ministryId,
  );
  const availableRoles = selectedMinistry?.roles ?? [];

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateWhatsapp(value: string) {
    updateField("whatsapp", formatBrazilianPhone(value));
  }

  function updateMinistry(ministryId: string) {
    const nextMinistry = ministries.find((ministry) => ministry.id === ministryId);

    setForm((current) => ({
      ...current,
      ministryId,
      roleId: nextMinistry?.roles[0]?.id ?? "",
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const payload = {
      name: form.name.trim().replace(/\s+/g, " "),
      whatsapp: getPhoneDigits(form.whatsapp),
      ministryId: form.ministryId,
      roleId: form.roleId,
    };

    if (payload.name.length < 2) {
      setLocalError("Informe um nome com pelo menos 2 caracteres.");
      return;
    }

    if (payload.whatsapp.length < 10) {
      setLocalError("Informe um WhatsApp valido.");
      return;
    }

    if (!payload.ministryId || !payload.roleId) {
      setLocalError("Selecione um ministério e uma função.");
      return;
    }

    onSubmit(payload);
  }

  const title = mode === "create" ? "Novo obreiro" : "Editar obreiro";
  const subtitle =
    mode === "create"
      ? "Vincule uma pessoa a um ministério e função."
      : "Atualize as informações e o vínculo deste obreiro.";
  const submitLabel = mode === "create" ? "Cadastrar obreiro" : "Salvar alterações";
  const Icon = mode === "create" ? UserPlus : Save;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 grid place-items-end bg-foreground/30 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="worker-modal-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Obreiros
            </p>
            <h2
              id="worker-modal-title"
              className="mt-2 text-2xl font-semibold text-foreground"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">{subtitle}</p>
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
          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              <span>Ministério</span>
              <select
                className="h-11 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-foreground transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
                value={form.ministryId}
                onChange={(event) => updateMinistry(event.target.value)}
                required
              >
                <option value="" disabled>
                  Selecione um ministério
                </option>
                {ministries.map((ministry) => (
                  <option key={ministry.id} value={ministry.id}>
                    {ministry.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              <span>Função</span>
              <select
                className="h-11 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-foreground transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                value={form.roleId}
                onChange={(event) => updateField("roleId", event.target.value)}
                disabled={availableRoles.length === 0}
                required
              >
                <option value="" disabled>
                  Selecione uma função
                </option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

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
