"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Tags,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ConfirmationModal,
  type ConfirmationModalProps,
} from "@/components/ui/confirmation-modal";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAuth } from "@/features/auth/auth-provider";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";
import {
  DEFAULT_PAGE_SIZE,
  fetchAllPaginatedItems,
  getEmptyPaginationMeta,
  type PaginationMeta,
} from "@/lib/pagination";

import { FinanceBalanceModal } from "./finance-balance-modal";
import { FinanceCategoryFormModal } from "./finance-category-form-modal";
import { FinanceTransactionFormModal } from "./finance-transaction-form-modal";
import {
  createFinanceCategory,
  createFinancialTransaction,
  deleteFinancialTransaction,
  getFinanceAccount,
  getFinanceCategories,
  listFinancialTransactions,
  setFinanceAccountBalance,
  settleFinancialTransaction,
  updateFinancialTransaction,
} from "../finance-service";
import type {
  CreateFinancialCategoryPayload,
  CreateFinancialTransactionPayload,
  FinancialAccount,
  FinancialCategories,
  FinancialTransaction,
  FinancialTransactionType,
  SetAccountBalancePayload,
  UpdateFinancialCategoryPayload,
  UpdateFinancialTransactionPayload,
} from "../finance-types";

const defaultCategories: FinancialCategories = {
  revenue: [],
  expense: [],
};

type ModalState =
  | { isOpen: false; mode: "create"; transaction: null; initialDate: string }
  | { isOpen: true; mode: "create"; transaction: null; initialDate: string }
  | {
      isOpen: true;
      mode: "edit";
      transaction: FinancialTransaction;
      initialDate: string;
    };

type ConfirmationState = Omit<
  ConfirmationModalProps,
  "isConfirming" | "onCancel"
> | null;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getTodayInputValue() {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
}

function getCurrentMonthValue() {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
}

function getInitialTransactionDate(month: string) {
  return month === getCurrentMonthValue() ? getTodayInputValue() : `${month}-01`;
}

function addMonths(monthValue: string, amount: number) {
  const [year, month] = monthValue.split("-").map(Number);
  const date = new Date(year, month - 1 + amount, 1);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function formatMonthTitle(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatCurrency(value: string | number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

function getTypeLabel(type: FinancialTransactionType) {
  return type === "REVENUE" ? "Receita" : "Despesa";
}

function getTypeTone(type: FinancialTransactionType) {
  return type === "REVENUE" ? "text-success" : "text-danger";
}

function buildCategoryMap(categories: FinancialCategories) {
  return [...categories.revenue, ...categories.expense].reduce<
    Record<string, string>
  >(
    (accumulator, category) => ({
      ...accumulator,
      [category.value]: category.label,
    }),
    {} as Record<string, string>,
  );
}

function getTransactionCategoryLabel(
  transaction: FinancialTransaction,
  categoryMap: Record<string, string>,
) {
  return (
    transaction.category?.label ??
    categoryMap[transaction.categoryId] ??
    "Categoria removida"
  );
}

function sumTransactions(
  transactions: FinancialTransaction[],
  predicate: (transaction: FinancialTransaction) => boolean,
) {
  return transactions
    .filter(predicate)
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
}

function createClosedModalState(month: string): ModalState {
  return {
    isOpen: false,
    mode: "create",
    transaction: null,
    initialDate: getInitialTransactionDate(month),
  };
}

export function FinancePageClient() {
  const router = useRouter();
  const { clearSession } = useAuth();
  const [account, setAccount] = useState<FinancialAccount | null>(null);
  const [categories, setCategories] =
    useState<FinancialCategories>(defaultCategories);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [summaryTransactions, setSummaryTransactions] = useState<
    FinancialTransaction[]
  >([]);
  const [transactionsPagination, setTransactionsPagination] =
    useState<PaginationMeta>(() => getEmptyPaginationMeta(DEFAULT_PAGE_SIZE));
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleMonth, setVisibleMonth] = useState(getCurrentMonthValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [modalState, setModalState] = useState<ModalState>(() =>
    createClosedModalState(getCurrentMonthValue()),
  );
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [categorySubmitError, setCategorySubmitError] = useState<string | null>(
    null,
  );
  const [confirmation, setConfirmation] = useState<ConfirmationState>(null);

  useEffect(() => {
    let ignore = false;

    async function loadFinance() {
      setIsLoading(true);
      setError(null);

      try {
        const [
          categoriesData,
          accountData,
          transactionsData,
          summaryTransactionsData,
        ] =
          await Promise.all([
            getFinanceCategories(),
            getFinanceAccount(),
            listFinancialTransactions({
              month: visibleMonth,
              page: currentPage,
              limit: DEFAULT_PAGE_SIZE,
            }),
            fetchAllPaginatedItems((pagination) =>
              listFinancialTransactions({
                month: visibleMonth,
                ...pagination,
              }),
            ),
          ]);

        if (!ignore) {
          setCategories(categoriesData);
          setAccount(accountData);
          setTransactions(transactionsData.items);
          setSummaryTransactions(summaryTransactionsData);
          setTransactionsPagination(transactionsData.meta);
        }
      } catch (err) {
        if (isUnauthorizedApiError(err)) {
          clearSession();
          router.push("/login");
          return;
        }

        if (!ignore) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadFinance();

    return () => {
      ignore = true;
    };
  }, [clearSession, currentPage, reloadKey, router, visibleMonth]);

  const categoryMap = buildCategoryMap(categories);
  const allCategories = [...categories.revenue, ...categories.expense];
  const hasCategories = allCategories.length > 0;
  const effectiveRevenue = sumTransactions(
    summaryTransactions,
    (transaction) =>
      transaction.isEffective && transaction.type === "REVENUE",
  );
  const effectiveExpense = sumTransactions(
    summaryTransactions,
    (transaction) =>
      transaction.isEffective && transaction.type === "EXPENSE",
  );
  const pendingAmount = sumTransactions(
    summaryTransactions,
    (transaction) => !transaction.isEffective,
  );
  const pendingCount = summaryTransactions.filter(
    (transaction) => !transaction.isEffective,
  ).length;

  function refreshFinance() {
    setReloadKey((current) => current + 1);
  }

  function goToPreviousMonth() {
    setVisibleMonth((current) => addMonths(current, -1));
    setCurrentPage(1);
  }

  function goToNextMonth() {
    setVisibleMonth((current) => addMonths(current, 1));
    setCurrentPage(1);
  }

  function goToCurrentMonth() {
    setVisibleMonth(getCurrentMonthValue());
    setCurrentPage(1);
  }

  function openBalanceModal() {
    setSubmitError(null);
    setIsBalanceModalOpen(true);
  }

  function closeBalanceModal() {
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setIsBalanceModalOpen(false);
  }

  function openCreateModal() {
    setSubmitError(null);
    setModalState({
      isOpen: true,
      mode: "create",
      transaction: null,
      initialDate: getInitialTransactionDate(visibleMonth),
    });
  }

  function openEditModal(transaction: FinancialTransaction) {
    setSubmitError(null);
    setModalState({
      isOpen: true,
      mode: "edit",
      transaction,
      initialDate: transaction.date.slice(0, 10),
    });
  }

  function closeTransactionModal() {
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setModalState(createClosedModalState(visibleMonth));
  }

  function openCreateCategoryModal() {
    setCategorySubmitError(null);
    setIsCategoryModalOpen(true);
  }

  function closeCategoryModal() {
    if (isCategorySubmitting) {
      return;
    }

    setCategorySubmitError(null);
    setIsCategoryModalOpen(false);
  }

  async function handleUnauthorized(err: unknown) {
    if (!isUnauthorizedApiError(err)) {
      return false;
    }

    clearSession();
    router.push("/login");
    return true;
  }

  async function handleBalanceSubmit(payload: SetAccountBalancePayload) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const updatedAccount = await setFinanceAccountBalance(payload);
      setAccount(updatedAccount);
      setIsBalanceModalOpen(false);
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setSubmitError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTransactionSubmit(
    payload:
      | CreateFinancialTransactionPayload
      | UpdateFinancialTransactionPayload,
  ) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (modalState.mode === "edit" && modalState.transaction) {
        await updateFinancialTransaction(
          modalState.transaction.id,
          payload as UpdateFinancialTransactionPayload,
        );
      } else {
        await createFinancialTransaction(
          payload as CreateFinancialTransactionPayload,
        );
      }

      setModalState(createClosedModalState(visibleMonth));
      if (modalState.mode === "create") {
        setCurrentPage(1);
      }
      refreshFinance();
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setSubmitError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCategorySubmit(
    payload: CreateFinancialCategoryPayload | UpdateFinancialCategoryPayload,
  ) {
    setIsCategorySubmitting(true);
    setCategorySubmitError(null);

    try {
      await createFinanceCategory(payload as CreateFinancialCategoryPayload);
      setIsCategoryModalOpen(false);
      refreshFinance();
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setCategorySubmitError(getApiErrorMessage(err));
    } finally {
      setIsCategorySubmitting(false);
    }
  }

  function handleSettle(transaction: FinancialTransaction) {
    setConfirmation({
      eyebrow: "Efetivação financeira",
      title: "Efetivar transação?",
      description: `Deseja efetivar a transação ${transaction.title}? Esta ação não poderá ser desfeita.`,
      confirmLabel: "Efetivar transação",
      confirmingLabel: "Efetivando...",
      variant: "primary",
      onConfirm: () => void confirmSettle(transaction),
    });
  }

  async function confirmSettle(transaction: FinancialTransaction) {
    setSettlingId(transaction.id);
    setError(null);

    try {
      await settleFinancialTransaction(transaction.id);
      refreshFinance();
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setSettlingId(null);
      setConfirmation(null);
    }
  }

  function handleDelete(transaction: FinancialTransaction) {
    setConfirmation({
      eyebrow: "Exclusão financeira",
      title: "Excluir transação?",
      description: `Deseja excluir a transação ${transaction.title}? Se ela estiver efetivada, o saldo será ajustado.`,
      confirmLabel: "Excluir transação",
      confirmingLabel: "Excluindo...",
      variant: "danger",
      onConfirm: () => void confirmDelete(transaction),
    });
  }

  async function confirmDelete(transaction: FinancialTransaction) {
    setDeletingId(transaction.id);
    setError(null);

    try {
      await deleteFinancialTransaction(transaction.id);
      if (transactions.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        refreshFinance();
      }
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
      setConfirmation(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:mb-8 sm:pb-6 xl:flex-row xl:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Controle
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Financeiro
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Acompanhe saldo, receitas, despesas e transações pendentes da igreja.
          </p>
        </div>

        <div className="grid gap-3 sm:flex sm:items-center">
          <Button type="button" variant="ghost" onClick={openBalanceModal}>
            <SlidersHorizontal size={17} />
            Ajustar saldo
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={openCreateCategoryModal}
          >
            <Tags size={17} />
            Nova categoria
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/app/financeiro/categorias")}
          >
            <Tags size={17} />
            Acessar categorias
          </Button>
          <Button
            type="button"
            onClick={openCreateModal}
            disabled={isLoading || Boolean(error) || !hasCategories}
          >
            <Plus size={17} />
            Nova transação
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 grid gap-3 border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:flex sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={refreshFinance}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-border bg-primary p-5 text-primary-foreground shadow-sm dark:bg-surface dark:text-foreground">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-medium opacity-75">Saldo atual</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Wallet size={17} />
            </span>
          </div>
          <p className="text-3xl font-semibold">
            {account ? formatCurrency(account.balance) : "R$ 0,00"}
          </p>
        </article>

        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-medium text-muted">Receitas efetivadas</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle text-success">
              <TrendingUp size={17} />
            </span>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {formatCurrency(effectiveRevenue)}
          </p>
        </article>

        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-medium text-muted">Despesas efetivadas</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle text-danger">
              <TrendingDown size={17} />
            </span>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {formatCurrency(effectiveExpense)}
          </p>
        </article>

        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-medium text-muted">Pendentes</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle text-accent">
              <Clock3 size={17} />
            </span>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {pendingCount}
          </p>
          <p className="mt-1 text-sm text-muted">{formatCurrency(pendingAmount)}</p>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface shadow-sm">
        <div className="grid gap-4 border-b border-border p-4 lg:flex lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
              <CircleDollarSign size={18} />
            </span>
            <div>
              <h2 className="text-base font-semibold capitalize text-foreground sm:text-lg">
                {formatMonthTitle(visibleMonth)}
              </h2>
              <p className="text-xs text-muted">
                Transações ordenadas por data mais recente
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Button
              type="button"
              variant="ghost"
              className="h-10 px-3"
              onClick={goToPreviousMonth}
            >
              <ArrowLeft size={16} />
              Anterior
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 px-3"
              onClick={goToCurrentMonth}
            >
              Mes atual
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-10 px-3"
              onClick={goToNextMonth}
            >
              Próximo
              <ArrowRight size={16} />
            </Button>
            <input
              type="month"
              className="h-10 min-w-36 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-foreground transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
              value={visibleMonth}
              onChange={(event) => {
                setVisibleMonth(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Selecionar mês"
            />
            <Button
              type="button"
              variant="ghost"
              className="h-10 px-3"
              onClick={refreshFinance}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <RefreshCw size={16} />
              )}
              Atualizar
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid min-h-64 place-items-center p-8 text-center text-sm text-muted">
            <div>
              <Loader2 className="mx-auto mb-3 animate-spin text-accent" size={24} />
              Carregando financeiro...
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="grid min-h-72 place-items-center p-8 text-center">
            <div className="max-w-sm">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
                <CircleDollarSign size={24} />
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                Nenhuma transação neste mês
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Cadastre a primeira receita ou despesa para iniciar o historico financeiro.
              </p>
              <Button
                type="button"
                className="mt-5"
                onClick={openCreateModal}
                disabled={!hasCategories}
              >
                <Plus size={17} />
                Cadastrar transação
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-3 p-3 md:hidden">
              {transactions.map((transaction) => (
                <article
                  key={transaction.id}
                  className="rounded-lg border border-border bg-surface-subtle p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                        {formatDateOnly(transaction.date)}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-foreground">
                        {transaction.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {getTransactionCategoryLabel(transaction, categoryMap)}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ${getTypeTone(transaction.type)}`}>
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="rounded-md border border-border bg-surface px-2 py-1 text-foreground">
                      {getTypeLabel(transaction.type)}
                    </span>
                    <span
                      className={`border px-2 py-1 ${
                        transaction.isEffective
                          ? "rounded-md border-success/30 bg-success/10 text-success"
                          : "border-accent/40 bg-accent/10 text-foreground"
                      }`}
                    >
                      {transaction.isEffective ? "Efetivada" : "Pendente"}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-3">
                    {!transaction.isEffective ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleSettle(transaction)}
                        disabled={settlingId === transaction.id}
                      >
                        {settlingId === transaction.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Efetivar
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => openEditModal(transaction)}
                    >
                      <Edit3 size={16} />
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => handleDelete(transaction)}
                      disabled={deletingId === transaction.id}
                    >
                      {deletingId === transaction.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Excluir
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                <thead className="border-b border-border bg-surface-subtle text-xs uppercase tracking-[0.14em] text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Data</th>
                    <th className="px-4 py-3 font-semibold">Título</th>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Categoria</th>
                    <th className="px-4 py-3 font-semibold">Valor</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-4 text-muted">
                        {formatDateOnly(transaction.date)}
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-foreground">
                          {transaction.title}
                        </p>
                        <p className="font-mono text-xs text-muted">
                          {transaction.id.slice(0, 8)}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`font-semibold ${getTypeTone(transaction.type)}`}>
                          {getTypeLabel(transaction.type)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-foreground">
                        {getTransactionCategoryLabel(transaction, categoryMap)}
                      </td>
                      <td className="px-4 py-4 font-semibold text-foreground">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex border px-2 py-1 text-xs font-semibold ${
                            transaction.isEffective
                              ? "rounded-md border-success/30 bg-success/10 text-success"
                              : "border-accent/40 bg-accent/10 text-foreground"
                          }`}
                        >
                          {transaction.isEffective ? "Efetivada" : "Pendente"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          {!transaction.isEffective ? (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => handleSettle(transaction)}
                              disabled={settlingId === transaction.id}
                            >
                              {settlingId === transaction.id ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : (
                                <CheckCircle2 size={16} />
                              )}
                              Efetivar
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => openEditModal(transaction)}
                          >
                            <Edit3 size={16} />
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            onClick={() => handleDelete(transaction)}
                            disabled={deletingId === transaction.id}
                          >
                            {deletingId === transaction.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <Trash2 size={16} />
                            )}
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <PaginationControls
          meta={transactionsPagination}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
        />
      </section>

      {isBalanceModalOpen ? (
        <FinanceBalanceModal
          currentBalance={account?.balance ?? "0.00"}
          isSubmitting={isSubmitting}
          error={submitError}
          onClose={closeBalanceModal}
          onSubmit={(payload) => void handleBalanceSubmit(payload)}
        />
      ) : null}

      {modalState.isOpen ? (
        <FinanceTransactionFormModal
          key={
            modalState.mode === "edit"
              ? modalState.transaction.id
              : modalState.initialDate
          }
          mode={modalState.mode}
          transaction={modalState.transaction}
          categories={categories}
          initialDate={modalState.initialDate}
          isSubmitting={isSubmitting}
          error={submitError}
          onClose={closeTransactionModal}
          onSubmit={(payload) => void handleTransactionSubmit(payload)}
        />
      ) : null}

      {isCategoryModalOpen ? (
        <FinanceCategoryFormModal
          key="create-category"
          mode="create"
          category={null}
          isSubmitting={isCategorySubmitting}
          error={categorySubmitError}
          onClose={closeCategoryModal}
          onSubmit={(payload) => void handleCategorySubmit(payload)}
        />
      ) : null}

      {confirmation ? (
        <ConfirmationModal
          {...confirmation}
          isConfirming={Boolean(settlingId || deletingId)}
          onCancel={() => setConfirmation(null)}
        />
      ) : null}
    </div>
  );
}
