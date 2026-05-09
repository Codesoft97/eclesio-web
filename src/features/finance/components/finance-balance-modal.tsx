"use client";

import { FormEvent, useState } from "react";
import { Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  currencyInputToDecimal,
  formatCurrencyInput,
} from "@/lib/formatters/currency";

import type { SetAccountBalancePayload } from "../finance-types";

interface FinanceBalanceModalProps {
  currentBalance: string;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: SetAccountBalancePayload) => void;
}

export function FinanceBalanceModal({
  currentBalance,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: FinanceBalanceModalProps) {
  const [balance, setBalance] = useState(() =>
    formatCurrencyInput(currentBalance),
  );
  const [localError, setLocalError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLocalError(null);

    const normalizedBalance = currencyInputToDecimal(balance);

    if (!/^\d{1,12}(\.\d{1,2})?$/.test(normalizedBalance)) {
      setLocalError("Informe um saldo valido, por exemplo R$ 1.500,00.");
      return;
    }

    onSubmit({ balance: normalizedBalance });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-foreground/25 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="finance-balance-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Conta financeira
            </p>
            <h2
              id="finance-balance-title"
              className="mt-2 text-2xl font-semibold text-foreground"
            >
              Ajustar saldo
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Defina o saldo atual da conta da igreja. Transacoes futuras partem desse valor.
            </p>
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
            label="Saldo atual"
            value={balance}
            onChange={(event) =>
              setBalance(formatCurrencyInput(event.target.value))
            }
            placeholder="R$ 1.500,00"
            inputMode="numeric"
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
              <Save size={17} />
              {isSubmitting ? "Salvando..." : "Salvar saldo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
