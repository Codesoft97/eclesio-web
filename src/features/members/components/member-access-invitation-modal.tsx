"use client";

import { Check, Copy, ExternalLink, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import type { MemberAccessInvitation } from "../member-types";

interface MemberAccessInvitationModalProps {
  invitation: MemberAccessInvitation;
  onClose: () => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value);
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);

  return Promise.resolve();
}

export function MemberAccessInvitationModal({
  invitation,
  onClose,
}: MemberAccessInvitationModalProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyText(invitation.inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="animate-fade-in fixed inset-0 z-50 grid place-items-end bg-foreground/30 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-access-invitation-title"
        className="animate-scale-in w-full max-w-lg rounded-2xl border border-border bg-surface shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Convite de acesso
            </p>
            <h2
              id="member-access-invitation-title"
              className="mt-2 text-xl font-semibold text-foreground"
            >
              Link gerado para {invitation.memberName}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              O link expira em {formatDate(invitation.expiresAt)}. Ao reenviar,
              um novo convite revoga os convites anteriores em aberto.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-muted transition-all duration-200 hover:border-accent hover:text-foreground"
            aria-label="Fechar convite"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 p-5">
          <div className="rounded-lg border border-border bg-surface-subtle p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              Link do membro
            </p>
            <p className="break-all font-mono text-xs leading-5 text-foreground">
              {invitation.inviteUrl}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
            <Button type="button" variant="ghost" onClick={onClose}>
              Fechar
            </Button>
            <Button type="button" variant="outline" onClick={handleCopy}>
              {copied ? <Check size={17} /> : <Copy size={17} />}
              {copied ? "Copiado" : "Copiar link"}
            </Button>
            <Button
              type="button"
              onClick={() =>
                window.open(invitation.inviteUrl, "_blank", "noopener,noreferrer")
              }
            >
              <ExternalLink size={17} />
              Abrir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
