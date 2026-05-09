"use client";

import { Check, Copy, ExternalLink, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { ChurchEvent, EventShareResponse } from "../event-types";

type CopiedTarget = "message" | "url" | null;

interface EventShareModalProps {
  event: ChurchEvent;
  share: EventShareResponse | null;
  isLoading: boolean;
  error: string | null;
  copied: CopiedTarget;
  onClose: () => void;
  onCopyMessage: () => void;
  onCopyUrl: () => void;
  onOpenWhatsapp: () => void;
}

export function EventShareModal({
  event,
  share,
  isLoading,
  error,
  copied,
  onClose,
  onCopyMessage,
  onCopyUrl,
  onOpenWhatsapp,
}: EventShareModalProps) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-foreground/25 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-share-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Compartilhar evento
            </p>
            <h2
              id="event-share-title"
              className="mt-2 text-2xl font-semibold text-foreground"
            >
              {event.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Copie o texto pronto ou envie direto pelo WhatsApp.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border border-border text-muted transition hover:border-accent hover:text-foreground"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 p-5">
          {isLoading ? (
            <div className="grid min-h-44 place-items-center text-sm text-muted">
              <div>
                <Loader2 className="mx-auto mb-3 animate-spin text-accent" size={24} />
                Preparando link de compartilhamento...
              </div>
            </div>
          ) : error ? (
            <p className="border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </p>
          ) : share ? (
            <>
              <div className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Link público</span>
                <div className="break-all border border-border bg-surface-subtle p-3 font-mono text-xs text-muted">
                  {share.shareUrl}
                </div>
              </div>

              <div className="grid gap-2">
                <span className="text-sm font-medium text-foreground">Texto para WhatsApp</span>
                <pre className="max-h-72 overflow-auto whitespace-pre-wrap border border-border bg-surface-subtle p-3 text-sm leading-6 text-foreground">
                  {share.message}
                </pre>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Button type="button" variant="ghost" onClick={onCopyUrl}>
                  {copied === "url" ? <Check size={16} /> : <Copy size={16} />}
                  {copied === "url" ? "Link copiado" : "Copiar link"}
                </Button>
                <Button type="button" variant="ghost" onClick={onCopyMessage}>
                  {copied === "message" ? <Check size={16} /> : <Copy size={16} />}
                  {copied === "message" ? "Texto copiado" : "Copiar texto"}
                </Button>
                <Button type="button" onClick={onOpenWhatsapp}>
                  <ExternalLink size={16} />
                  Enviar no WhatsApp
                </Button>
              </div>
            </>
          ) : (
            <p className="border border-border bg-surface-subtle p-3 text-sm text-muted">
              Não foi possível carregar o compartilhamento deste evento.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

