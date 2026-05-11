"use client";

import {
  CheckCircle2,
  Church,
  Loader2,
  UserCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api";

import {
  acceptPublicEventScheduleAssignment,
  declinePublicEventScheduleAssignment,
  getPublicEventScheduleAssignment,
} from "../event-service";
import type {
  EventScheduleConfirmationStatus,
  PublicEventScheduleAssignment,
} from "../event-types";

interface PublicScheduleConfirmationPageClientProps {
  confirmationToken: string;
}

const statusDetails: Record<
  EventScheduleConfirmationStatus,
  {
    label: string;
    description: string;
    className: string;
    icon: typeof CheckCircle2;
  }
> = {
  PENDING: {
    label: "Pendente",
    description: "Confirme se você poderá comparecer nesta escala.",
    className: "border-accent/40 bg-accent/10 text-foreground",
    icon: UserCheck,
  },
  ACCEPTED: {
    label: "Aceita",
    description: "Você confirmou presença nesta escala.",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  DECLINED: {
    label: "Recusada",
    description: "Você informou que não poderá comparecer nesta escala.",
    className: "border-danger/30 bg-danger/10 text-danger",
    icon: XCircle,
  },
};

function formatEventDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatResponseDate(value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PublicScheduleConfirmationPageClient({
  confirmationToken,
}: PublicScheduleConfirmationPageClientProps) {
  const [schedule, setSchedule] =
    useState<PublicEventScheduleAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<"accept" | "decline" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadSchedule() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getPublicEventScheduleAssignment(confirmationToken);

        if (!ignore) {
          setSchedule(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadSchedule();

    return () => {
      ignore = true;
    };
  }, [confirmationToken]);

  async function handleAccept() {
    setIsSubmitting("accept");
    setError(null);

    try {
      const data = await acceptPublicEventScheduleAssignment(confirmationToken);
      setSchedule(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(null);
    }
  }

  async function handleDecline() {
    setIsSubmitting("decline");
    setError(null);

    try {
      const data =
        await declinePublicEventScheduleAssignment(confirmationToken);
      setSchedule(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(null);
    }
  }

  const status = schedule ? statusDetails[schedule.confirmationStatus] : null;
  const StatusIcon = status?.icon;
  const responseDate = schedule
    ? formatResponseDate(schedule.respondedAt)
    : null;
  const canRespond = schedule?.confirmationStatus === "PENDING";

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-5">
          <Link href="/login" className="text-sm font-semibold text-foreground">
            Gerencia Igreja
          </Link>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Confirmação de escala
          </span>
        </div>

        {isLoading ? (
          <div className="grid min-h-96 place-items-center border border-border bg-surface p-8 text-center text-sm text-muted shadow-sm">
            <div>
              <Loader2
                className="mx-auto mb-3 animate-spin text-accent"
                size={24}
              />
              Carregando escala...
            </div>
          </div>
        ) : error && !schedule ? (
          <div className="border border-danger/30 bg-danger/10 p-6 text-sm text-danger">
            {error}
          </div>
        ) : schedule && status && StatusIcon ? (
          <article className="border border-border bg-surface shadow-sm">
            <div className="border-b border-border p-6">
              <div className="mb-5 flex h-14 w-14 items-center justify-center bg-accent text-accent-foreground">
                <UserCheck size={24} />
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                {formatEventDateTime(schedule.event.startsAt)}
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-foreground">
                {schedule.event.title}
              </h1>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                <Church size={16} />
                <span>{schedule.church.name}</span>
              </div>
            </div>

            <div className="grid gap-5 p-6">
              <div className={`border p-4 ${status.className}`}>
                <div className="flex items-start gap-3">
                  <StatusIcon className="mt-0.5 shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-semibold">{status.label}</p>
                    <p className="mt-1 text-sm leading-6 opacity-80">
                      {status.description}
                    </p>
                    {responseDate ? (
                      <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] opacity-70">
                        Respondida em {responseDate}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              {error ? (
                <p className="border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                  {error}
                </p>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-border bg-surface-subtle p-4">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                    Ministério
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {schedule.ministry.name}
                  </p>
                </div>
                <div className="border border-border bg-surface-subtle p-4">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                    Função
                  </p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {schedule.role.name}
                  </p>
                </div>
              </div>

              <div className="border border-border bg-surface-subtle p-4">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                  Obreiro
                </p>
                <p className="mt-2 text-base font-semibold text-foreground">
                  {schedule.worker.name}
                </p>
              </div>

              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                  Descrição do evento
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
                  {schedule.event.description}
                </p>
              </div>

              {canRespond ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={() => void handleAccept()}
                    disabled={isSubmitting !== null}
                  >
                    {isSubmitting === "accept" ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    Aceitar escala
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => void handleDecline()}
                    disabled={isSubmitting !== null}
                  >
                    {isSubmitting === "decline" ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <XCircle size={16} />
                    )}
                    Recusar escala
                  </Button>
                </div>
              ) : (
                <div className="border border-border bg-surface-subtle p-4 text-sm leading-6 text-muted">
                  Sua resposta já foi registrada. Se precisar alterar, fale com
                  o administrador da igreja.
                </div>
              )}
            </div>
          </article>
        ) : (
          <div className="border border-danger/30 bg-danger/10 p-6 text-sm text-danger">
            Escala não encontrada.
          </div>
        )}
      </div>
    </main>
  );
}
