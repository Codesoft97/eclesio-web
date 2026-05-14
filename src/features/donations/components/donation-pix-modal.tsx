"use client";

import { HeartHandshake, X } from "lucide-react";

import { DonationPixPanel } from "./donation-pix-panel";
import type { DonationCampaign } from "../donation-types";

interface DonationPixModalProps {
  campaign: DonationCampaign;
  onClose: () => void;
}

export function DonationPixModal({
  campaign,
  onClose,
}: DonationPixModalProps) {
  return (
    <div className="animate-fade-in fixed inset-0 z-50 grid place-items-end bg-foreground/30 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-pix-title"
        className="animate-scale-in max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface shadow-xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="flex items-start gap-3">
            <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
              <HeartHandshake size={18} />
            </span>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                Pix de doacao
              </p>
              <h2
                id="donation-pix-title"
                className="mt-2 text-2xl font-semibold text-foreground"
              >
                {campaign.title}
              </h2>
              {campaign.description ? (
                <p className="mt-1 text-sm leading-6 text-muted">
                  {campaign.description}
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border text-muted transition-all duration-200 hover:border-accent hover:text-foreground"
            aria-label="Fechar Pix"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          <DonationPixPanel campaign={campaign} />
        </div>
      </div>
    </div>
  );
}
