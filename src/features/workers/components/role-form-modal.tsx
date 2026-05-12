"use client";

import { FormEvent, useState } from "react";
import { BadgePlus, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

import type {
  CreateWorkerRolePayload,
  UpdateWorkerRolePayload,
  WorkerMinistry,
  WorkerRole,
} from "../worker-types";

type RoleFormMode = "create" | "edit";

interface RoleFormModalProps {
  mode: RoleFormMode;
  role: WorkerRole | null;
  ministries: WorkerMinistry[];
  initialMinistryId: string;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: CreateWorkerRolePayload | UpdateWorkerRolePayload) => void;
}

export function RoleFormModal({
  mode,
  role,
  ministries,
  initialMinistryId,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: RoleFormModalProps) {
  const [form, setForm] = useState(() => ({
    ministryId: role?.ministryId ?? initialMinistryId,
    name: role?.name ?? "",
  }));
  const [localError, setLocalError] = useState<string | null>(null);

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const name = form.name.trim().replace(/\s+/g, " ");

    if (name.length < 2) {
      setLocalError("Informe uma função com pelo menos 2 caracteres.");
      return;
    }

    if (mode === "create") {
      if (!form.ministryId) {
        setLocalError("Selecione um ministério.");
        return;
      }

      onSubmit({ ministryId: form.ministryId, name });
      return;
    }

    onSubmit({ name });
  }

  const title = mode === "create" ? "Nova função" : "Editar função";
  const subtitle =
    mode === "create"
      ? "Adicione uma função dentro de um ministério."
      : "Atualize o nome desta função.";
  const submitLabel = mode === "create" ? "Cadastrar função" : "Salvar alterações";
  const Icon = mode === "create" ? BadgePlus : Save;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 grid place-items-end bg-foreground/30 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="role-modal-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Funções
            </p>
            <h2
              id="role-modal-title"
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
          {mode === "create" ? (
            <label className="grid gap-2 text-sm font-medium text-foreground">
              <span>Ministério</span>
              <select
                className="h-11 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-foreground transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
                value={form.ministryId}
                onChange={(event) => updateField("ministryId", event.target.value)}
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
          ) : null}

          <Field
            label="Nome da função"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Portaria"
            required
          />

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
