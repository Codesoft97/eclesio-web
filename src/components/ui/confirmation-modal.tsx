"use client";

import { AlertTriangle, Loader2, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "./button";

export interface ConfirmationModalProps {
  eyebrow?: string;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmingLabel?: string;
  variant?: "primary" | "danger";
  isConfirming?: boolean;
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles = {
  primary: {
    icon: "border-accent/30 bg-accent/10 text-accent",
    eyebrow: "text-muted",
    buttonVariant: "primary" as const,
    defaultConfirmLabel: "Confirmar",
  },
  danger: {
    icon: "border-danger/30 bg-danger/10 text-danger",
    eyebrow: "text-danger",
    buttonVariant: "danger" as const,
    defaultConfirmLabel: "Excluir",
  },
};

export function ConfirmationModal({
  eyebrow = "Confirmação",
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  confirmingLabel = "Processando...",
  variant = "danger",
  isConfirming = false,
  children,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  const styles = variantStyles[variant];

  return (
    <div className="animate-fade-in fixed inset-0 z-[60] grid place-items-end bg-foreground/30 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-description"
        className="animate-scale-in w-full max-w-md rounded-2xl border border-border bg-surface shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="flex gap-4">
            <span
              className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${styles.icon}`}
            >
              <AlertTriangle size={20} />
            </span>
            <div>
              <p
                className={`font-mono text-xs uppercase tracking-[0.18em] ${styles.eyebrow}`}
              >
                {eyebrow}
              </p>
              <h2
                id="confirmation-modal-title"
                className="mt-2 text-xl font-semibold text-foreground"
              >
                {title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-muted transition-all duration-200 hover:border-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={"Fechar confirmação"}
            disabled={isConfirming}
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 p-5">
          <div
            id="confirmation-modal-description"
            className="text-sm leading-6 text-muted"
          >
            {description}
          </div>

          {children ? (
            <div className="rounded-lg border border-border bg-surface-subtle p-3 text-sm text-muted">
              {children}
            </div>
          ) : null}

          <div className="grid gap-3 pt-2 sm:grid-cols-[1fr_auto]">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isConfirming}
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={styles.buttonVariant}
              onClick={onConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? (
                <Loader2 className="animate-spin" size={17} />
              ) : null}
              {isConfirming
                ? confirmingLabel
                : confirmLabel ?? styles.defaultConfirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
