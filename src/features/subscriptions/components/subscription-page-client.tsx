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
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { acceptLegalDocuments } from "@/features/auth/auth-service";
import type {
  SubscriptionAccessStatus,
  SubscriptionBillingInterval,
  SubscriptionPlanCode,
} from "@/features/auth/auth-types";
import { needsLegalAcceptance } from "@/features/legal/components/legal-acceptance-page";
import { canTryCompletePlan } from "@/features/subscriptions/subscription-features";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";

import {
  createSubscriptionInvoice,
  getMySubscription,
  upgradeTrialToComplete,
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

function getPlanLabel(planCode: SubscriptionPlanCode | null | undefined) {
  if (planCode === "COMPLETE") {
    return "Completo";
  }

  if (planCode === "BASIC") {
    return "Básico";
  }

  return "Sem plano";
}

function getPlanSubtitle(planCode: SubscriptionPlanCode) {
  return planCode === "COMPLETE"
    ? "Todas as funcionalidades do sistema"
    : "Escalas, obreiros, eventos e WhatsApp automático";
}

function getPlanFeatures(planCode: SubscriptionPlanCode) {
  if (planCode === "COMPLETE") {
    return [
      "Membros e obreiros",
      "Portal dos membros",
      "Financeiro e relatórios",
      "Eventos e comunicados",
      "Doações via Pix",
      "Escalas com WhatsApp automático",
    ];
  }

  return [
    "Obreiros e ministérios",
    "Eventos e escalas",
    "Envio automático de escala pelo WhatsApp",
    "Sem portal de membros, comunicados, doações e relatórios",
  ];
}

const subscriptionPlanOrder: SubscriptionPlanCode[] = ["BASIC", "COMPLETE"];

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
  const planLabel = getPlanLabel(subscription.planCode).toLowerCase();

  if (subscription.status === "PAID") {
    return `Plano ${planLabel} ${getIntervalLabel(subscription.billingInterval).toLowerCase()} com acesso liberado ate ${formatDate(subscription.currentPeriodEndsAt)}.`;
  }

  if (subscription.status === "FREE_TRIAL") {
    return `Teste gratuito no plano ${planLabel} ate ${formatDate(subscription.trialEndsAt)}.`;
  }

  return "Para continuar usando o sistema, escolha um plano e pague via Pix.";
}

function getDefaultPlanCode(
  overview: SubscriptionOverview | null,
): SubscriptionPlanCode {
  return (
    overview?.pendingInvoice?.planCode ??
    overview?.subscription.planCode ??
    "BASIC"
  );
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
    current.planCode === next.planCode &&
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

function sortPlanOptions(options: SubscriptionPlanOption[]) {
  return [...options].sort((firstOption, secondOption) => {
    if (firstOption.billingInterval === secondOption.billingInterval) {
      return 0;
    }

    return firstOption.billingInterval === "MONTHLY" ? -1 : 1;
  });
}

function getStartingAmount(options: SubscriptionPlanOption[]) {
  return options.reduce<string | null>((lowestAmount, option) => {
    if (!lowestAmount) {
      return option.amount;
    }

    return Number(option.amount) < Number(lowestAmount)
      ? option.amount
      : lowestAmount;
  }, null);
}

function LegalAcceptanceModal({
  session,
  onClose,
  onAccepted,
  onUnauthorized,
}: {
  session: ReturnType<typeof useAuth>["session"];
  onClose: () => void;
  onAccepted: (
    session: NonNullable<ReturnType<typeof useAuth>["session"]>,
  ) => Promise<void>;
  onUnauthorized: () => void;
}) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacyPolicy, setAcceptedPrivacyPolicy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const currentTermsVersion =
    session?.legalAcceptance?.currentTermsVersion ?? "atual";
  const currentPrivacyPolicyVersion =
    session?.legalAcceptance?.currentPrivacyPolicyVersion ?? "atual";

  async function handleAccept() {
    setError(null);

    if (!acceptedTerms || !acceptedPrivacyPolicy) {
      setError("Marque os dois campos para confirmar o aceite.");
      return;
    }

    setIsSaving(true);

    try {
      const nextSession = await acceptLegalDocuments();
      await onAccepted(nextSession);
    } catch (err) {
      if (isUnauthorizedApiError(err)) {
        onUnauthorized();
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/55 px-4 py-6 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-acceptance-title"
        className="max-h-[calc(100vh-3rem)] w-full max-w-xl overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-xl"
      >
        <div className="mb-4 flex gap-3 border-b border-border pb-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <ShieldCheck size={20} />
          </span>
          <div>
            <p className="font-mono text-xs uppercase text-muted">
              Documentos legais
            </p>
            <h2
              id="legal-acceptance-title"
              className="mt-1 text-lg font-semibold text-foreground"
            >
              Aceite necessário para gerar o Pix
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Para
              gerar o Pix de pagamento, confirme a leitura dos documentos.
            </p>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border border-border bg-surface-subtle p-4 text-sm text-muted">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-1 h-4 w-4 shrink-0 accent-yellow-500"
            />
            <span>
              Li e aceito os{" "}
              <Link
                href="/termos-de-uso"
                target="_blank"
                className="font-semibold text-foreground underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
              >
                Termos de Uso
              </Link>{" "}
              versao {currentTermsVersion}.
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={acceptedPrivacyPolicy}
              onChange={(event) =>
                setAcceptedPrivacyPolicy(event.target.checked)
              }
              className="mt-1 h-4 w-4 shrink-0 accent-yellow-500"
            />
            <span>
              Li e aceito a{" "}
              <Link
                href="/politica-de-privacidade"
                target="_blank"
                className="font-semibold text-foreground underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
              >
                Politica de Privacidade
              </Link>{" "}
              versao {currentPrivacyPolicyVersion}.
            </span>
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <div className="mt-5 grid gap-3 sm:flex sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => void handleAccept()}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={17} />
            ) : (
              <CheckCircle2 size={17} />
            )}
            {isSaving ? "Gerando Pix..." : "Aceitar e gerar Pix"}
          </Button>
        </div>
      </section>
    </div>
  );
}

function PlanCodeButton({
  planCode,
  options,
  isSelected,
  onSelect,
}: {
  planCode: SubscriptionPlanCode;
  options: SubscriptionPlanOption[];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const startingAmount = getStartingAmount(options);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`grid w-full cursor-pointer gap-4 rounded-lg border p-4 text-left transition-all duration-200 ${
        isSelected
          ? "border-accent bg-accent/10 shadow-sm"
          : "border-border bg-surface hover:border-accent/50"
      }`}
    >
      <span className="flex items-start justify-between gap-3">
        <span>
          <span className="block text-sm font-semibold text-foreground">
            Plano {getPlanLabel(planCode)}
          </span>
          <span className="mt-1 block text-xs leading-5 text-muted">
            {getPlanSubtitle(planCode)}
          </span>
        </span>
        <span
          className={`rounded-md border px-2 py-1 text-xs font-semibold ${
            isSelected
              ? "border-accent/40 bg-accent text-accent-foreground"
              : "border-border bg-surface-subtle text-foreground"
          }`}
        >
          {isSelected ? "Selecionado" : "Escolher"}
        </span>
      </span>

      {startingAmount ? (
        <span className="rounded-lg border border-border bg-surface-subtle p-3">
          <span className="block text-xs font-semibold uppercase text-muted">
            Valor do plano mensal
          </span>
          <strong className="mt-1 block text-xl text-foreground">
            {formatCurrency(startingAmount)}
          </strong>
        </span>
      ) : null}

      <span className="grid gap-2 border-t border-border pt-3 text-xs leading-5 text-muted">
        {getPlanFeatures(planCode).map((feature) => (
          <span key={feature} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 shrink-0 text-accent" size={13} />
            {feature}
          </span>
        ))}
      </span>
    </button>
  );
}

function BillingIntervalButton({
  option,
  isSelected,
  onSelect,
}: {
  option: SubscriptionPlanOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isYearly = option.billingInterval === "YEARLY";

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
          {getIntervalLabel(option.billingInterval)}
        </span>
        <span className="mt-1 block text-xs leading-5 text-muted">
          {isYearly ? "12 meses de acesso" : "1 mês de acesso"}
        </span>
      </span>
      <span className="text-right">
        <strong className="block text-base text-foreground">
          {formatCurrency(option.amount)}
        </strong>
        <span className="text-xs text-muted">
          /{isYearly ? "ano" : "mês"}
        </span>
      </span>
    </button>
  );
}

function SubscriptionSelectionControls({
  planOptions,
  selectedPlanCode,
  selectedInterval,
  onSelectPlanCode,
  onSelectInterval,
}: {
  planOptions: SubscriptionPlanOption[];
  selectedPlanCode: SubscriptionPlanCode;
  selectedInterval: SubscriptionBillingInterval;
  onSelectPlanCode: (planCode: SubscriptionPlanCode) => void;
  onSelectInterval: (interval: SubscriptionBillingInterval) => void;
}) {
  const availablePlanCodes = subscriptionPlanOrder.filter((planCode) =>
    planOptions.some((option) => option.planCode === planCode),
  );
  const selectedPlanOptions = sortPlanOptions(
    planOptions.filter((option) => option.planCode === selectedPlanCode),
  );

  return (
    <div className="grid gap-4">
      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          1. Plano
        </p>
        <div className="grid gap-3">
          {availablePlanCodes.map((planCode) => (
            <PlanCodeButton
              key={planCode}
              planCode={planCode}
              options={planOptions.filter(
                (option) => option.planCode === planCode,
              )}
              isSelected={selectedPlanCode === planCode}
              onSelect={() => onSelectPlanCode(planCode)}
            />
          ))}
        </div>
      </section>

      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          2. Cobranca
        </p>
        <div className="grid gap-3">
          {selectedPlanOptions.map((option) => (
            <BillingIntervalButton
              key={`${option.planCode}-${option.billingInterval}`}
              option={option}
              isSelected={selectedInterval === option.billingInterval}
              onSelect={() => onSelectInterval(option.billingInterval)}
            />
          ))}
        </div>
      </section>
    </div>
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
        <p className="font-mono text-xs uppercase text-muted">Fatura Pix</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {formatCurrency(invoice.amount)}
            </h2>
            <p className="mt-1 text-sm text-muted">
              Plano {getPlanLabel(invoice.planCode).toLowerCase()}{" "}
              {getIntervalLabel(invoice.billingInterval).toLowerCase()}.
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
        Depois do pagamento, aguarde alguns minutos. Seremos notificados e vamos
        liberar o seu acesso; clique em atualizar para conferir a liberação.
      </p>
    </section>
  );
}

export function SubscriptionPageClient() {
  const router = useRouter();
  const { session, setSession, clearSession } = useAuth();
  const pixPanelRef = useRef<HTMLDivElement | null>(null);
  const highlightTimeoutRef = useRef<number | null>(null);
  const [overview, setOverview] = useState<SubscriptionOverview | null>(null);
  const [selectedPlanCode, setSelectedPlanCode] =
    useState<SubscriptionPlanCode>("BASIC");
  const [selectedInterval, setSelectedInterval] =
    useState<SubscriptionBillingInterval>("MONTHLY");
  const [invoice, setInvoice] = useState<SubscriptionInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpgradingTrial, setIsUpgradingTrial] = useState(false);
  const [isChangingSubscription, setIsChangingSubscription] = useState(false);
  const [isLegalAcceptanceModalOpen, setIsLegalAcceptanceModalOpen] =
    useState(false);
  const [isPixPanelHighlighted, setIsPixPanelHighlighted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyOverview(data: SubscriptionOverview) {
    setOverview(data);
    setInvoice(data.pendingInvoice);
    setSelectedPlanCode(getDefaultPlanCode(data));
    setSelectedInterval(getDefaultInterval(data));
    setIsChangingSubscription(false);

    if (session && !hasSameSubscription(session.subscription, data.subscription)) {
      setSession({
        ...session,
        subscription: data.subscription,
      });
    }
  }

  async function loadSubscription({ refreshing = false } = {}) {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = await getMySubscription();
      applyOverview(data);
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

  useEffect(
    () => () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    },
    [],
  );

  const subscription = overview?.subscription ?? session?.subscription;
  const selectedPlan = useMemo(
    () =>
      overview?.planOptions.find(
        (option) =>
          option.planCode === selectedPlanCode &&
          option.billingInterval === selectedInterval,
      ) ?? null,
    [overview?.planOptions, selectedInterval, selectedPlanCode],
  );

  function handleSelectPlanCode(planCode: SubscriptionPlanCode) {
    const planOptions = sortPlanOptions(
      overview?.planOptions.filter((option) => option.planCode === planCode) ??
        [],
    );
    const hasSelectedInterval = planOptions.some(
      (option) => option.billingInterval === selectedInterval,
    );

    setSelectedPlanCode(planCode);

    if (!hasSelectedInterval && planOptions[0]) {
      setSelectedInterval(planOptions[0].billingInterval);
    }
  }

  function handleStartIntervalChange() {
    const currentPlanCode = subscription?.planCode;
    const currentInterval = subscription?.billingInterval;

    if (!currentPlanCode || !currentInterval) {
      return;
    }

    setIsChangingSubscription(true);
    setSelectedPlanCode(currentPlanCode);
    setSelectedInterval(currentInterval === "MONTHLY" ? "YEARLY" : "MONTHLY");
  }

  function handleStartPlanChange() {
    const currentPlanCode = subscription?.planCode;
    const currentInterval = subscription?.billingInterval;

    if (!currentPlanCode || !currentInterval) {
      return;
    }

    const nextPlanCode: SubscriptionPlanCode =
      currentPlanCode === "BASIC" ? "COMPLETE" : "BASIC";
    const nextPlanOptions = sortPlanOptions(
      overview?.planOptions.filter(
        (option) => option.planCode === nextPlanCode,
      ) ?? [],
    );
    const hasCurrentInterval = nextPlanOptions.some(
      (option) => option.billingInterval === currentInterval,
    );

    setIsChangingSubscription(true);
    setSelectedPlanCode(nextPlanCode);
    setSelectedInterval(
      hasCurrentInterval
        ? currentInterval
        : (nextPlanOptions[0]?.billingInterval ?? currentInterval),
    );
  }

  function handleCancelSubscriptionChange() {
    if (subscription?.planCode) {
      setSelectedPlanCode(subscription.planCode);
    }

    if (subscription?.billingInterval) {
      setSelectedInterval(subscription.billingInterval);
    }

    setIsChangingSubscription(false);
  }

  async function createInvoiceForSelection() {
    setIsCreating(true);
    setError(null);

    try {
      const nextInvoice = await createSubscriptionInvoice({
        planCode: selectedPlanCode,
        billingInterval: selectedInterval,
      });
      setInvoice(nextInvoice);
      focusPixPanel();
      return true;
    } catch (err) {
      if (isUnauthorizedApiError(err)) {
        clearSession();
        router.replace("/login");
        return false;
      }

      setError(getApiErrorMessage(err));
      return false;
    } finally {
      setIsCreating(false);
    }
  }

  function focusPixPanel() {
    window.setTimeout(() => {
      pixPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 80);

    setIsPixPanelHighlighted(true);

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = window.setTimeout(() => {
      setIsPixPanelHighlighted(false);
      highlightTimeoutRef.current = null;
    }, 3600);
  }

  async function handleCreateInvoice() {
    if (needsLegalAcceptance(session)) {
      setIsLegalAcceptanceModalOpen(true);
      return;
    }

    await createInvoiceForSelection();
  }

  async function handleAcceptLegalDocumentsAndCreateInvoice(
    nextSession: NonNullable<typeof session>,
  ) {
    setSession(nextSession);
    await createInvoiceForSelection();
    setIsLegalAcceptanceModalOpen(false);
  }

  async function handleUpgradeTrial() {
    setIsUpgradingTrial(true);
    setError(null);

    try {
      const data = await upgradeTrialToComplete();
      applyOverview(data);
    } catch (err) {
      if (isUnauthorizedApiError(err)) {
        clearSession();
        router.replace("/login");
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setIsUpgradingTrial(false);
    }
  }

  function handleUnauthorized() {
    clearSession();
    router.replace("/login");
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

  const visibleInvoice = invoice ?? overview?.pendingInvoice ?? null;
  const canTryComplete = canTryCompletePlan(subscription);
  const currentPaidPlanCode =
    subscription?.status === "PAID" && !subscription.requiresPayment
      ? subscription.planCode
      : null;
  const currentPaidInterval =
    subscription?.status === "PAID" && !subscription.requiresPayment
      ? subscription.billingInterval
      : null;
  const hasActivePaidSubscription = Boolean(
    currentPaidPlanCode && currentPaidInterval,
  );
  const currentPlanOption =
    currentPaidPlanCode && currentPaidInterval
      ? (overview?.planOptions.find(
          (option) =>
            option.planCode === currentPaidPlanCode &&
            option.billingInterval === currentPaidInterval,
        ) ?? null)
      : null;
  const nextIntervalChangeLabel =
    currentPaidInterval === "MONTHLY" ? "anual" : "mensal";
  const nextPlanChangeLabel =
    currentPaidPlanCode === "BASIC" ? "completo" : "basico";
  const emptyInvoiceTitle = hasActivePaidSubscription
    ? "Nenhum Pix de renovação gerado"
    : "Nenhuma fatura Pix pendente";
  const emptyInvoiceDescription = hasActivePaidSubscription
    ? "Gere o Pix do proximo pagamento com base no plano atual da igreja."
    : "Selecione o plano e a cobrança ao lado para gerar o QR Code e o Pix copia e cola da assinatura.";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="font-mono text-xs uppercase text-muted">
            Assinatura
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Assinatura
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Escolha entre o plano básico e o completo, pague via Pix e mantenha
            o acesso da igreja funcionando sem interrupção.
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

      {canTryComplete ? (
        <section className="mb-5 rounded-xl border border-accent/40 bg-accent/10 p-5 shadow-sm">
          <div className="grid gap-4 md:flex md:items-center md:justify-between">
            <div className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Sparkles size={20} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Teste o plano completo durante o seu periodo gratuito
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                  Libere portal dos membros, comunicados, doações, financeiro e
                  relatórios sem alterar a data final do teste.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => void handleUpgradeTrial()}
              disabled={isUpgradingTrial}
            >
              {isUpgradingTrial ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Sparkles size={17} />
              )}
              Testar completo
            </Button>
          </div>
        </section>
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
              {subscription.requiresPayment
                ? "Pagamento necessario"
                : "Acesso liberado"}
            </span>
          </div>
        </section>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-5">
          {visibleInvoice ? (
            <div
              ref={pixPanelRef}
              className={`scroll-mt-6 rounded-xl transition-all duration-500 ${
                isPixPanelHighlighted
                  ? "ring-2 ring-accent ring-offset-4 ring-offset-background"
                  : ""
              }`}
            >
              {isPixPanelHighlighted ? (
                <p className="mb-3 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-semibold text-foreground">
                  Pix gerado. Escaneie o QR Code ou copie o codigo abaixo.
                </p>
              ) : null}
              <SubscriptionPixPanel invoice={visibleInvoice} />
            </div>
          ) : (
            <section className="grid min-h-80 place-items-center rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
              <div className="max-w-md">
                <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-subtle text-foreground">
                  <QrCode size={24} />
                </span>
                <h2 className="text-lg font-semibold text-foreground">
                  {emptyInvoiceTitle}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {emptyInvoiceDescription}
                </p>
              </div>
            </section>
          )}
        </div>

        <aside className="h-fit rounded-xl border border-border bg-surface p-4 shadow-sm">
          {hasActivePaidSubscription ? (
            <>
              <div className="mb-4 border-b border-border pb-4">
                <p className="font-mono text-xs uppercase text-muted">
                  Proximo pagamento
                </p>
                <h2 className="mt-2 text-lg font-semibold text-foreground">
                  Renovar assinatura
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Gerar o Pix da próxima cobrança com base no
                  plano atual da igreja.
                </p>
              </div>

              <div className="rounded-lg border border-border bg-surface-subtle p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                  Plano atual
                </p>
                <h3 className="mt-2 text-base font-semibold text-foreground">
                  Plano {getPlanLabel(currentPaidPlanCode)}{" "}
                  {getIntervalLabel(currentPaidInterval).toLowerCase()}
                </h3>
                {currentPlanOption ? (
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {formatCurrency(currentPlanOption.amount)}
                  </p>
                ) : null}
                <p className="mt-2 text-xs leading-5 text-muted">
                  {subscription?.currentPeriodEndsAt
                    ? `Periodo atual vence em ${formatDateOnly(subscription.currentPeriodEndsAt)}.`
                    : "Gere o Pix para renovar o proximo periodo."}
                </p>
              </div>

              {isChangingSubscription ? (
                <section className="mt-4 rounded-lg border border-accent/30 bg-accent/10 p-4">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs uppercase text-muted">
                        Alterar assinatura
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-foreground">
                        Escolha a nova combinacao
                      </h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 px-3 text-xs"
                      onClick={handleCancelSubscriptionChange}
                    >
                      Cancelar
                    </Button>
                  </div>
                  <SubscriptionSelectionControls
                    planOptions={overview?.planOptions ?? []}
                    selectedPlanCode={selectedPlanCode}
                    selectedInterval={selectedInterval}
                    onSelectPlanCode={handleSelectPlanCode}
                    onSelectInterval={setSelectedInterval}
                  />
                </section>
              ) : (
                <section className="mt-4 rounded-lg border border-border p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Quer mudar antes de pagar?
                  </p>
                  <div className="mt-3 grid gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto justify-start px-3 py-2 text-left text-xs"
                      onClick={handleStartIntervalChange}
                    >
                      Deseja mudar para {nextIntervalChangeLabel}?
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-auto justify-start px-3 py-2 text-left text-xs"
                      onClick={handleStartPlanChange}
                    >
                      Deseja mudar para o plano {nextPlanChangeLabel}?
                    </Button>
                  </div>
                </section>
              )}
            </>
          ) : (
            <>
              <div className="mb-4 border-b border-border pb-4">
                <p className="font-mono text-xs uppercase text-muted">
                  Planos
                </p>
                <h2 className="mt-2 text-lg font-semibold text-foreground">
                  Escolha a assinatura
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Primeiro selecione o plano. Depois escolha se prefere pagar
                  mensal ou anual.
                </p>
              </div>

              <SubscriptionSelectionControls
                planOptions={overview?.planOptions ?? []}
                selectedPlanCode={selectedPlanCode}
                selectedInterval={selectedInterval}
                onSelectPlanCode={handleSelectPlanCode}
                onSelectInterval={setSelectedInterval}
              />
            </>
          )}

          {selectedPlan ? (
            <div className="mt-4 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm">
              <p className="font-semibold text-foreground">
                Plano {getPlanLabel(selectedPlan.planCode)}{" "}
                {getIntervalLabel(selectedPlan.billingInterval).toLowerCase()}
              </p>
              <p className="mt-1 text-muted">
                {formatCurrency(selectedPlan.amount)} selecionado para gerar o
                Pix da assinatura.
              </p>
            </div>
          ) : null}

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
              : hasActivePaidSubscription && !isChangingSubscription
                ? "Gerar Pix do proximo pagamento"
                : `Gerar Pix ${getPlanLabel(selectedPlanCode).toLowerCase()}`}
          </Button>

          <p className="mt-3 text-xs leading-5 text-muted">
            {hasActivePaidSubscription && !isChangingSubscription
              ? "O Pix será gerado para a renovação do plano atual."
              : selectedPlan
                ? `Valor selecionado: ${formatCurrency(selectedPlan.amount)} no plano ${getPlanLabel(selectedPlan.planCode).toLowerCase()} ${getIntervalLabel(selectedPlan.billingInterval).toLowerCase()}.`
                : "Selecione um plano para gerar a fatura."}{" "}
            A liberação acontece após a confirmação manual do pagamento.
          </p>
        </aside>
      </div>

      {isLegalAcceptanceModalOpen ? (
        <LegalAcceptanceModal
          session={session}
          onClose={() => setIsLegalAcceptanceModalOpen(false)}
          onAccepted={handleAcceptLegalDocumentsAndCreateInvoice}
          onUnauthorized={handleUnauthorized}
        />
      ) : null}
    </div>
  );
}
