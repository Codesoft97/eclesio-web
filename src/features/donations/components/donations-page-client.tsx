"use client";

import {
  Edit3,
  Eye,
  EyeOff,
  HeartHandshake,
  Loader2,
  Plus,
  QrCode,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  ConfirmationModal,
  type ConfirmationModalProps,
} from "@/components/ui/confirmation-modal";
import { useAuth } from "@/features/auth/auth-provider";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";

import {
  createDonationCampaign,
  deleteDonationCampaign,
  listDonationCampaigns,
  updateDonationCampaign,
} from "../donation-service";
import type {
  DonationCampaign,
  DonationCampaignPayload,
} from "../donation-types";
import { DonationFormModal } from "./donation-form-modal";
import { DonationPixModal } from "./donation-pix-modal";

type ModalState =
  | { isOpen: false; mode: "create"; campaign: null }
  | { isOpen: true; mode: "create"; campaign: null }
  | { isOpen: true; mode: "edit"; campaign: DonationCampaign };

type ConfirmationState = Omit<
  ConfirmationModalProps,
  "isConfirming" | "onCancel"
> | null;

const closedModalState: ModalState = {
  isOpen: false,
  mode: "create",
  campaign: null,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getPreview(content: string | null) {
  if (!content) {
    return "Sem descricao.";
  }

  const normalized = content.trim().replace(/\s+/g, " ");
  return normalized.length > 130
    ? `${normalized.slice(0, 127).trim()}...`
    : normalized;
}

export function DonationsPageClient() {
  const router = useRouter();
  const { clearSession } = useAuth();
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [modalState, setModalState] = useState<ModalState>(closedModalState);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pixPreview, setPixPreview] = useState<DonationCampaign | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState>(null);

  useEffect(() => {
    let ignore = false;

    async function loadCampaigns() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await listDonationCampaigns();

        if (!ignore) {
          setCampaigns(data);
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

    void loadCampaigns();

    return () => {
      ignore = true;
    };
  }, [clearSession, reloadKey, router]);

  const activeCount = useMemo(
    () => campaigns.filter((campaign) => campaign.isActive).length,
    [campaigns],
  );

  function refreshCampaigns() {
    setReloadKey((current) => current + 1);
  }

  function openCreateModal() {
    setSubmitError(null);
    setModalState({ isOpen: true, mode: "create", campaign: null });
  }

  function openEditModal(campaign: DonationCampaign) {
    setSubmitError(null);
    setModalState({ isOpen: true, mode: "edit", campaign });
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setModalState(closedModalState);
  }

  async function handleUnauthorized(err: unknown) {
    if (!isUnauthorizedApiError(err)) {
      return false;
    }

    clearSession();
    router.push("/login");
    return true;
  }

  async function handleSubmit(payload: DonationCampaignPayload) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (modalState.mode === "edit" && modalState.campaign) {
        await updateDonationCampaign(modalState.campaign.id, payload);
      } else {
        await createDonationCampaign(payload);
      }

      setModalState(closedModalState);
      refreshCampaigns();
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setSubmitError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(campaign: DonationCampaign) {
    setUpdatingId(campaign.id);
    setError(null);

    try {
      const updated = await updateDonationCampaign(campaign.id, {
        title: campaign.title,
        description: campaign.description ?? undefined,
        pixKey: campaign.pixKey,
        receiverName: campaign.receiverName ?? undefined,
        receiverCity: campaign.receiverCity ?? undefined,
        isActive: !campaign.isActive,
      });

      setCampaigns((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  }

  function handleDelete(campaign: DonationCampaign) {
    setConfirmation({
      eyebrow: "Doacoes",
      title: "Excluir objetivo?",
      description: `Deseja excluir o objetivo "${campaign.title}"? O Pix deixara de aparecer para os membros.`,
      confirmLabel: "Excluir objetivo",
      confirmingLabel: "Excluindo...",
      variant: "danger",
      onConfirm: () => void confirmDelete(campaign),
    });
  }

  async function confirmDelete(campaign: DonationCampaign) {
    setDeletingId(campaign.id);
    setError(null);

    try {
      await deleteDonationCampaign(campaign.id);
      setCampaigns((current) =>
        current.filter((item) => item.id !== campaign.id),
      );
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
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 xl:flex-row xl:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Financeiro
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Doações
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Crie objetivos de doação com chave Pix própria. Os objetivos ativos
            aparecem no portal dos membros com QR Code e Pix copia e cola.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm shadow-sm">
            <span className="text-muted">Ativos no portal</span>
            <strong className="ml-3 text-foreground">{activeCount}</strong>
          </div>
          <Button type="button" onClick={openCreateModal}>
            <Plus size={17} />
            Novo objetivo
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={refreshCampaigns}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
              <HeartHandshake size={18} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Objetivos cadastrados
              </h2>
              <p className="text-xs text-muted">
                Cada objetivo pode usar uma chave Pix diferente
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={refreshCampaigns}
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

        {isLoading ? (
          <div className="grid min-h-64 place-items-center p-8 text-center text-sm text-muted">
            <div>
              <Loader2
                className="mx-auto mb-3 animate-spin text-accent"
                size={24}
              />
              Carregando doações...
            </div>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div className="max-w-sm">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-subtle text-foreground">
                <HeartHandshake size={24} />
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                Nenhum objetivo criado
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Cadastre a primeira opção de doação para disponibilizar aos
                membros.
              </p>
              <Button type="button" className="mt-5" onClick={openCreateModal}>
                <Plus size={17} />
                Criar objetivo
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] border-collapse text-left text-sm">
              <thead className="border-b border-border bg-surface-subtle text-xs uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Objetivo</th>
                  <th className="px-4 py-3 font-semibold">Chave Pix</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Criado em</th>
                  <th className="px-4 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr
                    key={campaign.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <p className="font-medium text-foreground">
                        {campaign.title}
                      </p>
                      <p className="mt-1 max-w-xl text-xs leading-5 text-muted">
                        {getPreview(campaign.description)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="max-w-64 truncate font-mono text-xs text-foreground">
                        {campaign.pixKey}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {campaign.receiverName ?? "Recebedor nao informado"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${
                          campaign.isActive
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-border bg-surface-subtle text-muted"
                        }`}
                      >
                        {campaign.isActive ? (
                          <Eye size={13} />
                        ) : (
                          <EyeOff size={13} />
                        )}
                        {campaign.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {formatDate(campaign.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setPixPreview(campaign)}
                        >
                          <QrCode size={16} />
                          Pix
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleToggleActive(campaign)}
                          disabled={updatingId === campaign.id}
                        >
                          {updatingId === campaign.id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : campaign.isActive ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                          {campaign.isActive ? "Inativar" : "Ativar"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => openEditModal(campaign)}
                        >
                          <Edit3 size={16} />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleDelete(campaign)}
                          disabled={deletingId === campaign.id}
                        >
                          {deletingId === campaign.id ? (
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
        )}
      </section>

      {modalState.isOpen ? (
        <DonationFormModal
          key={modalState.mode === "edit" ? modalState.campaign.id : "create"}
          mode={modalState.mode}
          campaign={modalState.campaign}
          isSubmitting={isSubmitting}
          error={submitError}
          onClose={closeModal}
          onSubmit={(payload) => void handleSubmit(payload)}
        />
      ) : null}

      {pixPreview ? (
        <DonationPixModal
          campaign={pixPreview}
          onClose={() => setPixPreview(null)}
        />
      ) : null}

      {confirmation ? (
        <ConfirmationModal
          {...confirmation}
          isConfirming={Boolean(deletingId)}
          onCancel={() => setConfirmation(null)}
        />
      ) : null}
    </div>
  );
}
