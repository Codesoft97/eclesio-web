"use client";

import { FormEvent, useState } from "react";
import { Megaphone, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

import type { Announcement, AnnouncementPayload } from "../announcement-types";

type AnnouncementFormMode = "create" | "edit";

interface AnnouncementFormModalProps {
  mode: AnnouncementFormMode;
  announcement: Announcement | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: AnnouncementPayload) => void;
}

export function AnnouncementFormModal({
  mode,
  announcement,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: AnnouncementFormModalProps) {
  const [form, setForm] = useState(() => ({
    title: announcement?.title ?? "",
    content: announcement?.content ?? "",
    isPublished: announcement?.isPublished ?? false,
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
      content: form.content.trim(),
      isPublished: form.isPublished,
    };

    if (payload.title.length < 3) {
      setLocalError("Informe um titulo com pelo menos 3 caracteres.");
      return;
    }

    if (payload.content.length < 3) {
      setLocalError("Informe o conteudo do comunicado.");
      return;
    }

    onSubmit(payload);
  }

  const title = mode === "create" ? "Novo comunicado" : "Editar comunicado";
  const submitLabel = mode === "create" ? "Criar comunicado" : "Salvar";
  const Icon = mode === "create" ? Megaphone : Save;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 grid place-items-end bg-foreground/30 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-modal-title"
        className="animate-scale-in w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Comunicados
            </p>
            <h2
              id="announcement-modal-title"
              className="mt-2 text-2xl font-semibold text-foreground"
            >
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Publique avisos simples para aparecerem no portal dos membros.
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
            label="Titulo"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Culto especial de domingo"
            maxLength={120}
            required
          />

          <label className="grid gap-2 text-sm font-medium text-foreground">
            <span>Conteudo</span>
            <textarea
              value={form.content}
              onChange={(event) => updateField("content", event.target.value)}
              placeholder="Escreva o comunicado para os membros..."
              rows={7}
              maxLength={5000}
              required
              className="min-h-40 rounded-lg border border-border bg-surface-subtle px-3.5 py-3 text-sm text-foreground shadow-xs transition-all duration-200 placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
            />
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-border bg-surface-subtle p-3 text-sm text-foreground">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) =>
                updateField("isPublished", event.target.checked)
              }
              className="mt-1 h-4 w-4 accent-accent"
            />
            <span>
              <span className="block font-semibold">Publicar agora</span>
              <span className="text-xs leading-5 text-muted">
                Comunicados publicados aparecem no portal dos membros.
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
