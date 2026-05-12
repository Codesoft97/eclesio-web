"use client";

import { FormEvent, useState } from "react";
import { BanknoteArrowDown, BanknoteArrowUp, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  currencyInputToDecimal,
  formatCurrencyInput,
} from "@/lib/formatters/currency";

import type {
  CreateFinancialTransactionPayload,
  FinancialCategories,
  FinancialTransaction,
  FinancialTransactionCategory,
  FinancialTransactionType,
  UpdateFinancialTransactionPayload,
} from "../finance-types";

type TransactionFormMode = "create" | "edit";

interface FinanceTransactionFormModalProps {
  mode: TransactionFormMode;
  transaction: FinancialTransaction | null;
  categories: FinancialCategories;
  initialDate: string;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (
    payload:
      | CreateFinancialTransactionPayload
      | UpdateFinancialTransactionPayload,
  ) => void;
}

function getDateInputValue(value: string) {
  return value.slice(0, 10);
}

function getInitialCategory(
  type: FinancialTransactionType,
  categories: FinancialCategories,
) {
  return type === "REVENUE"
    ? categories.revenue[0]?.value
    : categories.expense[0]?.value;
}

function getCategoryOptions(
  type: FinancialTransactionType,
  categories: FinancialCategories,
) {
  return type === "REVENUE" ? categories.revenue : categories.expense;
}

export function FinanceTransactionFormModal({
  mode,
  transaction,
  categories,
  initialDate,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: FinanceTransactionFormModalProps) {
  const [form, setForm] = useState(() => {
    const initialType = transaction?.type ?? "REVENUE";

    return {
      title: transaction?.title ?? "",
      type: initialType as FinancialTransactionType,
      category:
        transaction?.category ??
        getInitialCategory(initialType, categories) ??
        "TITHES",
      amount: transaction?.amount ? formatCurrencyInput(transaction.amount) : "",
      date: transaction ? getDateInputValue(transaction.date) : initialDate,
      isEffective: transaction?.isEffective ?? false,
    };
  });
  const [localError, setLocalError] = useState<string | null>(null);

  function updateField<K extends keyof typeof form>(
    field: K,
    value: (typeof form)[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateType(type: FinancialTransactionType) {
    const options = getCategoryOptions(type, categories);
    const category = options.some((option) => option.value === form.category)
      ? form.category
      : options[0]?.value;

    setForm((current) => ({
      ...current,
      type,
      category: category ?? current.category,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const amount = currencyInputToDecimal(form.amount);
    const categoryOptions = getCategoryOptions(form.type, categories);
    const selectedCategory = form.category as FinancialTransactionCategory;

    if (form.title.trim().replace(/\s+/g, " ").length < 2) {
      setLocalError("Informe um título com pelo menos 2 caracteres.");
      return;
    }

    if (!/^\d{1,12}(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0) {
      setLocalError("Informe um valor maior que zero, por exemplo R$ 250,00.");
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) {
      setLocalError("Informe uma data valida.");
      return;
    }

    if (!categoryOptions.some((option) => option.value === selectedCategory)) {
      setLocalError("Selecione uma categoria compativel com o tipo.");
      return;
    }

    const payload = {
      title: form.title.trim().replace(/\s+/g, " "),
      type: form.type,
      category: selectedCategory,
      amount,
      date: form.date,
      ...(mode === "create" ? { isEffective: form.isEffective } : {}),
    };

    onSubmit(payload);
  }

  const title = mode === "create" ? "Nova transação" : "Editar transação";
  const subtitle =
    mode === "create"
      ? "Registre uma receita ou despesa da igreja."
      : transaction?.isEffective
        ? "Ao editar uma transação efetivada, o saldo será ajustado automaticamente."
        : "Atualize os dados desta transação pendente.";
  const submitLabel =
    mode === "create" ? "Cadastrar transação" : "Salvar alterações";
  const Icon = mode === "create" ? BanknoteArrowUp : Save;
  const categoryOptions = getCategoryOptions(form.type, categories);

  return (
    <div className="animate-fade-in fixed inset-0 z-50 grid place-items-end bg-foreground/30 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="finance-transaction-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Financeiro
            </p>
            <h2
              id="finance-transaction-title"
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
          <Field
            label="Título"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Dizimo mensal"
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-foreground">
              <span>Tipo</span>
              <select
                className="h-11 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-foreground transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
                value={form.type}
                onChange={(event) =>
                  updateType(event.target.value as FinancialTransactionType)
                }
              >
                <option value="REVENUE">Receita</option>
                <option value="EXPENSE">Despesa</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground">
              <span>Categoria</span>
              <select
                className="h-11 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-foreground transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
                value={form.category}
                onChange={(event) =>
                  updateField(
                    "category",
                    event.target.value as FinancialTransactionCategory,
                  )
                }
              >
                {categoryOptions.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Valor"
              value={form.amount}
              onChange={(event) =>
                updateField("amount", formatCurrencyInput(event.target.value))
              }
              placeholder="R$ 250,00"
              inputMode="numeric"
              required
            />
            <Field
              label="Data"
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              required
            />
          </div>

          {mode === "create" ? (
            <label className="flex cursor-pointer items-start gap-3 border border-border bg-surface-subtle p-3 text-sm text-foreground">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 cursor-pointer accent-[var(--accent)]"
                checked={form.isEffective}
                onChange={(event) =>
                  updateField("isEffective", event.target.checked)
                }
              />
              <span>
                <span className="font-semibold">Efetivar agora</span>
                <span className="mt-1 block text-muted">
                  Se marcado, o saldo será atualizado imediatamente.
                </span>
              </span>
            </label>
          ) : transaction?.isEffective ? (
            <div className="flex gap-3 border border-accent/40 bg-accent/10 p-3 text-sm text-foreground">
              <BanknoteArrowDown
                className="mt-0.5 shrink-0 text-accent"
                size={17}
              />
              Esta transação já foi efetivada. A efetivação não pode ser desfeita,
              mas alterações de valor ou tipo ajustam o saldo automaticamente.
            </div>
          ) : null}

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
