"use client";

import {
  ArrowLeft,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Tags,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ConfirmationModal,
  type ConfirmationModalProps,
} from "@/components/ui/confirmation-modal";
import { useAuth } from "@/features/auth/auth-provider";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";

import { FinanceCategoryFormModal } from "./finance-category-form-modal";
import {
  createFinanceCategory,
  deleteFinanceCategory,
  getFinanceCategories,
  updateFinanceCategory,
} from "../finance-service";
import type {
  CreateFinancialCategoryPayload,
  FinancialCategories,
  FinancialCategory,
  UpdateFinancialCategoryPayload,
} from "../finance-types";

const defaultCategories: FinancialCategories = {
  revenue: [],
  expense: [],
};

type CategoryModalState =
  | { isOpen: false; mode: "create"; category: null }
  | { isOpen: true; mode: "create"; category: null }
  | { isOpen: true; mode: "edit"; category: FinancialCategory };

type ConfirmationState = Omit<
  ConfirmationModalProps,
  "isConfirming" | "onCancel"
> | null;

export function FinanceCategoriesPageClient() {
  const router = useRouter();
  const { clearSession } = useAuth();
  const [categories, setCategories] =
    useState<FinancialCategories>(defaultCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [modalState, setModalState] = useState<CategoryModalState>({
    isOpen: false,
    mode: "create",
    category: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null,
  );
  const [confirmation, setConfirmation] = useState<ConfirmationState>(null);

  useEffect(() => {
    let ignore = false;

    async function loadCategories() {
      setIsLoading(true);
      setError(null);

      try {
        const categoriesData = await getFinanceCategories();

        if (!ignore) {
          setCategories(categoriesData);
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

    void loadCategories();

    return () => {
      ignore = true;
    };
  }, [clearSession, reloadKey, router]);

  function refreshCategories() {
    setReloadKey((current) => current + 1);
  }

  async function handleUnauthorized(err: unknown) {
    if (!isUnauthorizedApiError(err)) {
      return false;
    }

    clearSession();
    router.push("/login");
    return true;
  }

  function openCreateModal() {
    setSubmitError(null);
    setModalState({
      isOpen: true,
      mode: "create",
      category: null,
    });
  }

  function openEditModal(category: FinancialCategory) {
    setSubmitError(null);
    setModalState({
      isOpen: true,
      mode: "edit",
      category,
    });
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setModalState({
      isOpen: false,
      mode: "create",
      category: null,
    });
  }

  async function handleSubmit(
    payload: CreateFinancialCategoryPayload | UpdateFinancialCategoryPayload,
  ) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (modalState.mode === "edit") {
        await updateFinanceCategory(
          modalState.category.id,
          payload as UpdateFinancialCategoryPayload,
        );
      } else {
        await createFinanceCategory(payload as CreateFinancialCategoryPayload);
      }

      setModalState({
        isOpen: false,
        mode: "create",
        category: null,
      });
      refreshCategories();
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setSubmitError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete(category: FinancialCategory) {
    setConfirmation({
      eyebrow: "Categoria financeira",
      title: "Excluir categoria?",
      description: `Deseja excluir a categoria ${category.label}? Categorias com transacoes vinculadas nao podem ser excluidas.`,
      confirmLabel: "Excluir categoria",
      confirmingLabel: "Excluindo...",
      variant: "danger",
      onConfirm: () => void confirmDelete(category),
    });
  }

  async function confirmDelete(category: FinancialCategory) {
    setDeletingCategoryId(category.id);
    setError(null);

    try {
      await deleteFinanceCategory(category.id);
      refreshCategories();
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setDeletingCategoryId(null);
      setConfirmation(null);
    }
  }

  function renderCategoryGroup(
    title: string,
    description: string,
    items: FinancialCategory[],
    tone: "success" | "danger",
  ) {
    const toneClass = tone === "success" ? "text-success" : "text-danger";

    return (
      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="grid gap-3 border-b border-border p-4 sm:flex sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
              <Tags size={18} />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground sm:text-lg">
                {title}
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                {description}
              </p>
            </div>
          </div>
          <span className={`text-sm font-semibold ${toneClass}`}>
            {items.length} categoria(s)
          </span>
        </div>

        {items.length === 0 ? (
          <div className="p-4">
            <p className="rounded-lg border border-dashed border-border bg-surface-subtle p-4 text-sm text-muted">
              Nenhuma categoria cadastrada.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 p-4">
            {items.map((category) => (
              <article
                key={category.id}
                className="grid gap-3 rounded-lg border border-border bg-surface-subtle p-4 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-foreground">
                    {category.label}
                  </h3>
                  <p className="mt-1 text-xs text-muted">
                    {category.isDefault
                      ? "Categoria padrao"
                      : "Categoria personalizada"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-10 px-3"
                    onClick={() => openEditModal(category)}
                  >
                    <Edit3 size={16} />
                    Editar
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    className="h-10 px-3"
                    onClick={() => handleDelete(category)}
                    disabled={deletingCategoryId === category.id}
                  >
                    {deletingCategoryId === category.id ? (
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
        )}
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:mb-8 sm:pb-6 xl:flex-row xl:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Financeiro
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Categorias financeiras
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Gerencie as categorias usadas para classificar receitas e despesas.
          </p>
        </div>

        <div className="grid gap-3 sm:flex sm:items-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/app/financeiro")}
          >
            <ArrowLeft size={17} />
            Voltar para financeiro
          </Button>
          <Button type="button" onClick={openCreateModal}>
            <Plus size={17} />
            Nova categoria
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 grid gap-3 border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:flex sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={refreshCategories}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid min-h-64 place-items-center rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted shadow-sm">
          <div>
            <Loader2 className="mx-auto mb-3 animate-spin text-accent" size={24} />
            Carregando categorias...
          </div>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {renderCategoryGroup(
            "Receitas",
            "Entradas financeiras como dizimos, ofertas, doacoes e outras fontes.",
            categories.revenue,
            "success",
          )}
          {renderCategoryGroup(
            "Despesas",
            "Saidas financeiras como manutencao, alimentacao, estrutura e custos operacionais.",
            categories.expense,
            "danger",
          )}
        </div>
      )}

      {modalState.isOpen ? (
        <FinanceCategoryFormModal
          key={
            modalState.mode === "edit"
              ? modalState.category.id
              : "create-category"
          }
          mode={modalState.mode}
          category={modalState.category}
          isSubmitting={isSubmitting}
          error={submitError}
          onClose={closeModal}
          onSubmit={(payload) => void handleSubmit(payload)}
        />
      ) : null}

      {confirmation ? (
        <ConfirmationModal
          {...confirmation}
          isConfirming={Boolean(deletingCategoryId)}
          onCancel={() => setConfirmation(null)}
        />
      ) : null}
    </div>
  );
}
