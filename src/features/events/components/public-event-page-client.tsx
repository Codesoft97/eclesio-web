"use client";

import { CalendarDays, Church, Loader2, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api";

import { getPublicEvent } from "../event-service";
import type { PublicChurchEvent } from "../event-types";

interface PublicEventPageClientProps {
  shareToken: string;
}

function formatEventDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildShareMessage(event: PublicChurchEvent) {
  if (typeof window === "undefined") {
    return "";
  }

  return [
    `Você está convidado para o evento: ${event.title}`,
    `Igreja: ${event.church.name}`,
    `Data e hora: ${formatEventDateTime(event.startsAt)}`,
    "",
    event.description,
    "",
    `Acesse os detalhes: ${window.location.href}`,
  ].join("\n");
}

export function PublicEventPageClient({
  shareToken,
}: PublicEventPageClientProps) {
  const [event, setEvent] = useState<PublicChurchEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadEvent() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getPublicEvent(shareToken);

        if (!ignore) {
          setEvent(data);
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

    void loadEvent();

    return () => {
      ignore = true;
    };
  }, [shareToken]);

  function openWhatsapp() {
    if (!event) {
      return;
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(buildShareMessage(event))}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-5">
          <Link href="/login" className="text-sm font-semibold text-foreground">
            Gerencia Igreja
          </Link>
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Evento público
          </span>
        </div>

        {isLoading ? (
          <div className="grid min-h-96 place-items-center border border-border bg-surface p-8 text-center text-sm text-muted shadow-sm">
            <div>
              <Loader2
                className="mx-auto mb-3 animate-spin text-accent"
                size={24}
              />
              Carregando evento...
            </div>
          </div>
        ) : error || !event ? (
          <div className="border border-danger/30 bg-danger/10 p-6 text-sm text-danger">
            {error ?? "Evento não encontrado."}
          </div>
        ) : (
          <article className="border border-border bg-surface shadow-sm">
            <div className="border-b border-border p-6">
              <div className="mb-5 flex h-14 w-14 items-center justify-center bg-accent text-accent-foreground">
                <CalendarDays size={24} />
              </div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                {formatEventDateTime(event.startsAt)}
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-foreground">
                {event.title}
              </h1>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted">
                <Church size={16} />
                <span>{event.church.name}</span>
              </div>
            </div>

            <div className="grid gap-6 p-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                  Descrição
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
                  {event.description}
                </p>
              </div>

              <div className="grid gap-3 border-l-2 border-accent bg-surface-subtle p-4 text-sm leading-6 text-muted">
                <strong className="text-foreground">
                  Compartilhe este convite
                </strong>
                <span>
                  Envie este evento para membros, visitantes ou grupos da igreja
                  pelo WhatsApp.
                </span>
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  onClick={openWhatsapp}
                >
                  <Share2 size={17} />
                  Compartilhar no WhatsApp
                </Button>
              </div>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}
