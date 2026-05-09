"use client";

import { FormEvent, useState } from "react";
import { Landmark, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

import type {
  CreateWorkerMinistryPayload,
  UpdateWorkerMinistryPayload,
  WorkerMinistry,
} from "../worker-types";

type MinistryFormMode = "create" | "edit";

interface MinistryFormModalProps {
  mode: MinistryFormMode;
  ministry: WorkerMinistry | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (
    payload: CreateWorkerMinistryPayload | UpdateWorkerMinistryPayload,
  ) => void;
}

function parseRoles(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,\n]/)
        .map((role) => role.trim().replace(/\s+/g, " "))
        .filter(Boolean),
    ),
  );
}

export function MinistryFormModal({
  mode,
  ministry,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: MinistryFormModalProps) {
  const [form, setForm] = useState(() => ({
    name: ministry?.name ?? "",
    roles: "",
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
      setLocalError("Informe um nome com pelo menos 2 caracteres.");
      return;
    }

    if (mode === "create") {
      const roles = parseRoles(form.roles);

      if (roles.length === 0) {
        setLocalError("Informe pelo menos uma função para o ministério.");
        return;
      }

      onSubmit({ name, roles });
      return;
    }

    onSubmit({ name });
  }

  const title = mode === "create" ? "Novo ministério" : "Editar ministério";
  const subtitle =
    mode === "create"
      ? "Todo ministério precisa nascer com pelo menos uma função."
      : "Altere o nome do ministério. Funções são gerenciadas separadamente.";
  const submitLabel = mode === "create" ? "Cadastrar ministério" : "Salvar alterações";
  const Icon = mode === "create" ? Landmark : Save;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-foreground/25 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ministry-modal-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Ministérios
            </p>
            <h2
              id="ministry-modal-title"
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
            label="Nome do ministério"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Recepção"
            required
          />

          {mode === "create" ? (
            <label className="grid gap-2 text-sm font-medium text-foreground">
              <span>Funções iniciais</span>
              <textarea
                className="min-h-28 resize-y border border-border bg-surface px-3 py-3 text-sm text-foreground transition placeholder:text-muted focus:border-accent focus:outline-none"
                value={form.roles}
                onChange={(event) => updateField("roles", event.target.value)}
                placeholder="Portaria, Estacionamento, Apoio"
                required
              />
              <span className="text-xs font-normal text-muted">
                Separe por virgula ou por linha.
              </span>
            </label>
          ) : null}

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
