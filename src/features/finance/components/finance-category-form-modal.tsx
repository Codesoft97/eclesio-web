"use client";

import { FormEvent, useState } from "react";
import { Save, Tags, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

import type {
  CreateFinancialCategoryPayload,
  FinancialCategory,
  FinancialTransactionType,
  UpdateFinancialCategoryPayload,
} from "../finance-types";

type CategoryFormMode = "create" | "edit";

interface FinanceCategoryFormModalProps {
  mode: CategoryFormMode;
  category: FinancialCategory | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (
    payload: CreateFinancialCategoryPayload | UpdateFinancialCategoryPayload,
  ) => void;
}

function getTypeLabel(type: FinancialTransactionType) {
  return type === "REVENUE" ? "Receita" : "Despesa";
}

export function FinanceCategoryFormModal({
  mode,
  category,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: FinanceCategoryFormModalProps) {
  const [form, setForm] = useState(() => ({
    name: category?.name ?? "",
    type: category?.type ?? ("REVENUE" as FinancialTransactionType),
  }));
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const name = form.name.trim().replace(/\s+/g, " ");

    if (name.length < 2) {
      setLocalError("Informe uma categoria com pelo menos 2 caracteres.");
      return;
    }

    onSubmit(
      mode === "create"
        ? { name, type: form.type }
        : {
            name,
          },
    );
  }

  const title = mode === "create" ? "Nova categoria" : "Editar categoria";

  return (
    <div className="animate-fade-in fixed inset-0 z-50 grid place-items-end bg-foreground/30 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="finance-category-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Financeiro
            </p>
            <h2
              id="finance-category-title"
              className="mt-2 text-2xl font-semibold text-foreground"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Organize as receitas e despesas com categorias próprias.
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
          {mode === "create" ? (
            <label className="grid gap-2 text-sm font-medium text-foreground">
              <span>Tipo</span>
              <select
                className="h-11 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-foreground transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value as FinancialTransactionType,
                  }))
                }
              >
                <option value="REVENUE">Receita</option>
                <option value="EXPENSE">Despesa</option>
              </select>
            </label>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-subtle p-3 text-sm text-foreground">
              <Tags size={17} />
              Categoria de {getTypeLabel(form.type).toLowerCase()}
            </div>
          )}

          <Field
            label="Nome"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Missões"
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
              <Save size={17} />
              {isSubmitting ? "Salvando..." : "Salvar categoria"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
