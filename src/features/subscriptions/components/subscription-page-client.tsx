"use client";

import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  Loader2,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import type {
  SubscriptionAccessStatus,
  SubscriptionBillingInterval,
} from "@/features/auth/auth-types";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";

import {
  createSubscriptionInvoice,
  getMySubscription,
} from "../subscription-service";
import type {
  SubscriptionInvoice,
  SubscriptionOverview,
  SubscriptionPlanOption,
} from "../subscription-types";

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatDate(value: string | null) {
  if (!value) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDateOnly(value: string | null) {
  if (!value) {
    return "Sem data";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(new Date(value));
}

function getIntervalLabel(interval: SubscriptionBillingInterval | null) {
  if (interval === "YEARLY") {
    return "Anual";
  }

  if (interval === "MONTHLY") {
    return "Mensal";
  }

  return "Sem plano escolhido";
}

function getSubscriptionTitle(subscription: SubscriptionAccessStatus) {
  if (subscription.status === "PAID") {
    return "Assinatura ativa";
  }

  if (subscription.status === "FREE_TRIAL") {
    return "Teste gratuito ativo";
  }

  return "Assinatura pendente";
}

function getSubscriptionDescription(subscription: SubscriptionAccessStatus) {
  if (subscription.status === "PAID") {
    return `Plano ${getIntervalLabel(subscription.billingInterval).toLowerCase()} com acesso liberado ate ${formatDate(subscription.currentPeriodEndsAt)}.`;
  }

  if (subscription.status === "FREE_TRIAL") {
    return `Acesso liberado no periodo de teste ate ${formatDate(subscription.trialEndsAt)}.`;
  }

  return "Para continuar usando o sistema, escolha um plano e pague via Pix.";
}

function getDefaultInterval(
  overview: SubscriptionOverview | null,
): SubscriptionBillingInterval {
  return (
    overview?.pendingInvoice?.billingInterval ??
    overview?.subscription.billingInterval ??
    "MONTHLY"
  );
}

function hasSameSubscription(
  current: SubscriptionAccessStatus | undefined,
  next: SubscriptionAccessStatus,
) {
  return (
    current?.status === next.status &&
    current.billingInterval === next.billingInterval &&
    current.trialEndsAt === next.trialEndsAt &&
    current.currentPeriodEndsAt === next.currentPeriodEndsAt &&
    current.requiresPayment === next.requiresPayment
  );
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

function PlanOptionButton({
  option,
  isSelected,
  onSelect,
}: {
  option: SubscriptionPlanOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border p-4 text-left transition-all duration-200 ${
        isSelected
          ? "border-accent bg-accent/10 shadow-sm"
          : "border-border bg-surface hover:border-accent/50"
      }`}
    >
      <span>
        <span className="block text-sm font-semibold text-foreground">
          Plano {getIntervalLabel(option.billingInterval)}
        </span>
        <span className="mt-1 block text-xs text-muted">
          {option.billingInterval === "YEARLY"
            ? "12 meses de acesso"
            : "1 mes de acesso"}
        </span>
      </span>
      <strong className="text-base text-foreground">
        {formatCurrency(option.amount)}
      </strong>
    </button>
  );
}

function SubscriptionPixPanel({ invoice }: { invoice: SubscriptionInvoice }) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrCodeError, setQrCodeError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function generateQrCode() {
      setQrCodeUrl(null);
      setQrCodeError(null);

      try {
        const dataUrl = await QRCode.toDataURL(invoice.pixCopyPaste, {
          errorCorrectionLevel: "M",
          margin: 2,
          width: 232,
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
  }, [invoice.pixCopyPaste]);

  async function handleCopy() {
    await copyText(invoice.pixCopyPaste);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="rounded-xl border border-border bg-surface shadow-sm">
      <div className="border-b border-border p-4">
        <p className="font-mono text-xs uppercase text-muted">
          Fatura Pix
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {formatCurrency(invoice.amount)}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Plano {getIntervalLabel(invoice.billingInterval).toLowerCase()}.
              Fatura pendente ate {formatDate(invoice.dueDate)}.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <QrCode size={14} />
            Aguardando Pix
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[auto_minmax(0,1fr)]">
        <div className="grid place-items-center rounded-lg border border-border bg-white p-3">
          {qrCodeUrl ? (
            <Image
              src={qrCodeUrl}
              alt="QR Code Pix da assinatura"
              width={232}
              height={232}
              unoptimized
              className="h-56 w-56"
            />
          ) : (
            <div className="grid h-56 w-56 place-items-center text-muted">
              {qrCodeError ? (
                <QrCode size={32} />
              ) : (
                <Loader2 className="animate-spin text-accent" size={28} />
              )}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface-subtle p-3">
              <p className="text-xs font-semibold uppercase text-muted">
                Codigo da fatura
              </p>
              <p className="mt-2 font-mono text-lg font-semibold text-foreground">
                {invoice.paymentReference}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-surface-subtle p-3">
              <p className="text-xs font-semibold uppercase text-muted">
                Periodo liberado
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {formatDateOnly(invoice.billingPeriodStart)} a{" "}
                {formatDateOnly(invoice.billingPeriodEnd)}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface-subtle p-3">
            <p className="mb-2 text-xs font-semibold uppercase text-muted">
              Pix copia e cola
            </p>
            <p className="max-h-44 overflow-auto break-all font-mono text-xs leading-5 text-foreground">
              {invoice.pixCopyPaste}
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

      <p className="border-t border-border px-4 py-3 text-xs leading-5 text-muted">
        Depois do pagamento, aguarde alguns minutos
        . Seremos notificados e vamos liberar o seu acesso, clique em atualizar para liberar ou
        renovar o acesso.
      </p>
    </section>
  );
}

export function SubscriptionPageClient() {
  const router = useRouter();
  const { session, setSession, clearSession } = useAuth();
  const [overview, setOverview] = useState<SubscriptionOverview | null>(null);
  const [selectedInterval, setSelectedInterval] =
    useState<SubscriptionBillingInterval>("MONTHLY");
  const [invoice, setInvoice] = useState<SubscriptionInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSubscription({ refreshing = false } = {}) {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await getMySubscription();
      setOverview(data);
      setInvoice(data.pendingInvoice);
      setSelectedInterval(getDefaultInterval(data));

      if (session && !hasSameSubscription(session.subscription, data.subscription)) {
        setSession({
          ...session,
          subscription: data.subscription,
        });
      }
    } catch (err) {
      if (isUnauthorizedApiError(err)) {
        clearSession();
        router.replace("/login");
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadSubscription(), 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedPlan = useMemo(
    () =>
      overview?.planOptions.find(
        (option) => option.billingInterval === selectedInterval,
      ) ?? null,
    [overview?.planOptions, selectedInterval],
  );

  async function handleCreateInvoice() {
    setIsCreating(true);
    setError(null);

    try {
      const nextInvoice = await createSubscriptionInvoice({
        billingInterval: selectedInterval,
      });
      setInvoice(nextInvoice);
    } catch (err) {
      if (isUnauthorizedApiError(err)) {
        clearSession();
        router.replace("/login");
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-sm text-muted">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin text-accent" size={18} />
          Carregando assinatura...
        </div>
      </div>
    );
  }

  const subscription = overview?.subscription ?? session?.subscription;
  const visibleInvoice = invoice ?? overview?.pendingInvoice ?? null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="font-mono text-xs uppercase text-muted">
            Conta e assinatura
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Assinatura
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Escolha um plano, pague via Pix e mantenha o acesso da igreja,
            administradores e membros funcionando sem interrupcao.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void loadSubscription({ refreshing: true })}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <RefreshCw size={16} />
          )}
          Atualizar
        </Button>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {subscription ? (
        <section
          className={`mb-5 rounded-xl border p-5 shadow-sm ${
            subscription.requiresPayment
              ? "border-danger/30 bg-danger/10"
              : "border-border bg-surface"
          }`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex gap-3">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                  subscription.requiresPayment
                    ? "bg-danger/10 text-danger"
                    : "bg-accent text-accent-foreground"
                }`}
              >
                {subscription.requiresPayment ? (
                  <CreditCard size={20} />
                ) : (
                  <ShieldCheck size={20} />
                )}
              </span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {getSubscriptionTitle(subscription)}
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                  {getSubscriptionDescription(subscription)}
                </p>
              </div>
            </div>
            <span
              className={`inline-flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold ${
                subscription.requiresPayment
                  ? "border-danger/30 bg-danger/10 text-danger"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {subscription.requiresPayment ? (
                <CreditCard size={14} />
              ) : (
                <CheckCircle2 size={14} />
              )}
              {subscription.requiresPayment ? "Pagamento necessario" : "Acesso liberado"}
            </span>
          </div>
        </section>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="grid gap-5">
          {visibleInvoice ? (
            <SubscriptionPixPanel invoice={visibleInvoice} />
          ) : (
            <section className="grid min-h-80 place-items-center rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
              <div className="max-w-md">
                <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-subtle text-foreground">
                  <QrCode size={24} />
                </span>
                <h2 className="text-lg font-semibold text-foreground">
                  Nenhuma fatura Pix pendente
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Selecione mensal ou anual ao lado para gerar o QR Code e o Pix
                  copia e cola da assinatura.
                </p>
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="mb-4 border-b border-border pb-4">
            <p className="font-mono text-xs uppercase text-muted">
              Planos
            </p>
            <h2 className="mt-2 text-lg font-semibold text-foreground">
              Escolha a cobranca
            </h2>
          </div>

          <div className="grid gap-3">
            {overview?.planOptions.map((option) => (
              <PlanOptionButton
                key={option.billingInterval}
                option={option}
                isSelected={selectedInterval === option.billingInterval}
                onSelect={() => setSelectedInterval(option.billingInterval)}
              />
            ))}
          </div>

          <Button
            type="button"
            className="mt-4 w-full"
            onClick={() => void handleCreateInvoice()}
            disabled={!selectedPlan || isCreating}
          >
            {isCreating ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <CreditCard size={17} />
            )}
            {isCreating
              ? "Gerando Pix..."
              : `Gerar Pix ${getIntervalLabel(selectedInterval).toLowerCase()}`}
          </Button>

          <p className="mt-3 text-xs leading-5 text-muted">
            {selectedPlan
              ? `Valor selecionado: ${formatCurrency(selectedPlan.amount)}.`
              : "Selecione um plano para gerar a fatura."}{" "}
            A liberacao acontece apos a confirmacao manual do pagamento.
          </p>
        </aside>
      </div>
    </div>
  );
}
