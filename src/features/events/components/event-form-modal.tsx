"use client";

import { FormEvent, useState } from "react";
import { CalendarPlus, Repeat2, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

import type { ChurchEvent, EventPayload } from "../event-types";

type EventFormMode = "create" | "edit";

interface EventFormModalProps {
  mode: EventFormMode;
  event: ChurchEvent | null;
  initialDate: Date;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: EventPayload) => void;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function toTimeInputValue(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getTimezoneOffset(date: Date) {
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offset);
  const hours = Math.floor(absoluteOffset / 60);
  const minutes = absoluteOffset % 60;

  return `${sign}${pad(hours)}:${pad(minutes)}`;
}

function toIsoWithTimezone(dateValue: string, timeValue: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const [hours, minutes] = timeValue.split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

  return `${dateValue}T${timeValue}:00${getTimezoneOffset(localDate)}`;
}

function getInitialForm(event: ChurchEvent | null, initialDate: Date) {
  if (event) {
    const startsAt = new Date(event.startsAt);

    return {
      title: event.title,
      description: event.description,
      date: toDateInputValue(startsAt),
      time: toTimeInputValue(startsAt),
      isRecurring: false,
    };
  }

  return {
    title: "",
    description: "",
    date: toDateInputValue(initialDate),
    time: "19:00",
    isRecurring: false,
  };
}

export function EventFormModal({
  mode,
  event,
  initialDate,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: EventFormModalProps) {
  const [form, setForm] = useState(() => getInitialForm(event, initialDate));
  const [localError, setLocalError] = useState<string | null>(null);

  function updateField(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(eventSubmit: FormEvent<HTMLFormElement>) {
    eventSubmit.preventDefault();
    setLocalError(null);

    if (!form.date || !form.time) {
      setLocalError("Informe a data e hora do evento.");
      return;
    }

    const payload: EventPayload = {
      title: form.title.trim().replace(/\s+/g, " "),
      description: form.description.trim(),
      startsAt: toIsoWithTimezone(form.date, form.time),
    };

    if (mode === "create" && form.isRecurring) {
      payload.isRecurring = true;
    }

    if (payload.title.length < 2) {
      setLocalError("Informe um título com pelo menos 2 caracteres.");
      return;
    }

    if (payload.description.length < 3) {
      setLocalError("Informe uma descrição com pelo menos 3 caracteres.");
      return;
    }

    onSubmit(payload);
  }

  const title = mode === "create" ? "Novo evento" : "Editar evento";
  const subtitle =
    mode === "create"
      ? "Agende uma atividade no calendário da igreja. Se for culto recorrente, criamos as ocorrências semanais do ano."
      : "Atualize esta ocorrência. Em eventos recorrentes, a alteração vale apenas para este dia.";
  const submitLabel = mode === "create" ? "Cadastrar evento" : "Salvar alterações";
  const Icon = mode === "create" ? CalendarPlus : Save;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 grid place-items-end bg-foreground/30 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Eventos
            </p>
            <h2
              id="event-modal-title"
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
            onChange={(eventChange) =>
              updateField("title", eventChange.target.value)
            }
            placeholder="Culto de Domingo"
            required
          />

          <label className="grid gap-2 text-sm font-medium text-foreground">
            <span>Descrição</span>
            <textarea
              className="min-h-32 resize-y border border-border bg-surface px-3 py-3 text-sm text-foreground transition placeholder:text-muted focus:border-accent focus:outline-none"
              value={form.description}
              onChange={(eventChange) =>
                updateField("description", eventChange.target.value)
              }
              placeholder="Descreva o objetivo, local ou detalhes importantes do evento."
              required
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Data"
              type="date"
              value={form.date}
              onChange={(eventChange) =>
                updateField("date", eventChange.target.value)
              }
              required
            />
            <Field
              label="Hora"
              type="time"
              value={form.time}
              onChange={(eventChange) =>
                updateField("time", eventChange.target.value)
              }
              required
            />
          </div>

          {mode === "create" ? (
            <label className="flex cursor-pointer items-start gap-3 border border-border bg-surface-subtle p-4 text-sm text-foreground">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 cursor-pointer accent-[var(--color-accent)]"
                checked={form.isRecurring}
                onChange={(eventChange) =>
                  updateField("isRecurring", eventChange.target.checked)
                }
              />
              <span>
                <span className="flex items-center gap-2 font-semibold">
                  <Repeat2 size={16} />
                  Repetir semanalmente até o fim do ano
                </span>
                <span className="mt-1 block leading-6 text-muted">
                  Ideal para cultos fixos. A recorrência usa o mesmo dia da
                  semana da data selecionada, não o dia do mês.
                </span>
              </span>
            </label>
          ) : event?.isRecurring ? (
            <div className="border border-accent/30 bg-accent/10 p-4 text-sm leading-6 text-foreground">
              Este evento faz parte de uma recorrência. Nesta versão, editar ou
              excluir afeta apenas esta ocorrência.
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
