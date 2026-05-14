"use client";

import { Check, Copy, Loader2, QrCode } from "lucide-react";
import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import type { DonationCampaign } from "../donation-types";

interface DonationPixPanelProps {
  campaign: DonationCampaign;
  compact?: boolean;
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

export function DonationPixPanel({
  campaign,
  compact = false,
}: DonationPixPanelProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrCodeError, setQrCodeError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function generateQrCode() {
      setQrCodeError(null);
      setQrCodeUrl(null);

      try {
        const dataUrl = await QRCode.toDataURL(campaign.pixCopyPaste, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: compact ? 176 : 232,
        });

        if (!ignore) {
          setQrCodeUrl(dataUrl);
        }
      } catch {
        if (!ignore) {
          setQrCodeError("Nao foi possivel gerar o QR Code.");
        }
      }
    }

    void generateQrCode();

    return () => {
      ignore = true;
    };
  }, [campaign.pixCopyPaste, compact]);

  async function handleCopy() {
    await copyText(campaign.pixCopyPaste);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)]">
      <div className="grid place-items-center rounded-lg border border-border bg-white p-3">
        {qrCodeUrl ? (
          <Image
            src={qrCodeUrl}
            alt={`QR Code Pix para ${campaign.title}`}
            width={compact ? 176 : 232}
            height={compact ? 176 : 232}
            unoptimized
            className={compact ? "h-44 w-44" : "h-56 w-56"}
          />
        ) : (
          <div
            className={`grid place-items-center text-muted ${
              compact ? "h-44 w-44" : "h-56 w-56"
            }`}
          >
            {qrCodeError ? (
              <QrCode size={32} />
            ) : (
              <Loader2 className="animate-spin text-accent" size={28} />
            )}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="rounded-lg border border-border bg-surface-subtle p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            Pix copia e cola
          </p>
          <p className="max-h-36 overflow-auto break-all font-mono text-xs leading-5 text-foreground">
            {campaign.pixCopyPaste}
          </p>
        </div>

        {qrCodeError ? (
          <p className="mt-3 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {qrCodeError}
          </p>
        ) : null}

        <Button type="button" className="mt-3 w-full" onClick={handleCopy}>
          {copied ? <Check size={17} /> : <Copy size={17} />}
          {copied ? "Pix copiado" : "Copiar Pix"}
        </Button>
      </div>
    </div>
  );
}
