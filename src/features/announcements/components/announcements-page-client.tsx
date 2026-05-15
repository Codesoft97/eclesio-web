/* eslint-disable @next/next/no-img-element */
"use client";

import {
  Edit3,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  Megaphone,
  Plus,
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
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAuth } from "@/features/auth/auth-provider";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";
import {
  DEFAULT_PAGE_SIZE,
  getEmptyPaginationMeta,
  type PaginationMeta,
} from "@/lib/pagination";

import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  updateAnnouncement,
} from "../announcement-service";
import type { Announcement, AnnouncementPayload } from "../announcement-types";
import { AnnouncementFormModal } from "./announcement-form-modal";

type ModalState =
  | { isOpen: false; mode: "create"; announcement: null }
  | { isOpen: true; mode: "create"; announcement: null }
  | { isOpen: true; mode: "edit"; announcement: Announcement };

type ConfirmationState = Omit<
  ConfirmationModalProps,
  "isConfirming" | "onCancel"
> | null;

const closedModalState: ModalState = {
  isOpen: false,
  mode: "create",
  announcement: null,
};

function formatDate(value: string | null) {
  if (!value) {
    return "Nao publicado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function getPreview(content: string) {
  const normalized = content.trim().replace(/\s+/g, " ");
  return normalized.length > 160
    ? `${normalized.slice(0, 157).trim()}...`
    : normalized;
}

export function AnnouncementsPageClient() {
  const router = useRouter();
  const { clearSession } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(() =>
    getEmptyPaginationMeta(DEFAULT_PAGE_SIZE),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [modalState, setModalState] = useState<ModalState>(closedModalState);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState>(null);

  useEffect(() => {
    let ignore = false;

    async function loadAnnouncements() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await listAnnouncements({
          page: currentPage,
          limit: DEFAULT_PAGE_SIZE,
        });

        if (!ignore) {
          setAnnouncements(data.items);
          setPagination(data.meta);
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

    void loadAnnouncements();

    return () => {
      ignore = true;
    };
  }, [clearSession, currentPage, reloadKey, router]);

  const publishedCount = useMemo(
    () => announcements.filter((announcement) => announcement.isPublished).length,
    [announcements],
  );

  function refreshAnnouncements() {
    setReloadKey((current) => current + 1);
  }

  function openCreateModal() {
    setSubmitError(null);
    setModalState({ isOpen: true, mode: "create", announcement: null });
  }

  function openEditModal(announcement: Announcement) {
    setSubmitError(null);
    setModalState({ isOpen: true, mode: "edit", announcement });
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

  async function handleSubmit(payload: AnnouncementPayload) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (modalState.mode === "edit" && modalState.announcement) {
        await updateAnnouncement(modalState.announcement.id, payload);
      } else {
        await createAnnouncement(payload);
      }

      setModalState(closedModalState);
      if (modalState.mode === "create") {
        setCurrentPage(1);
      }
      refreshAnnouncements();
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setSubmitError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleTogglePublished(announcement: Announcement) {
    setPublishingId(announcement.id);
    setError(null);

    try {
      const updated = await updateAnnouncement(announcement.id, {
        title: announcement.title,
        content: announcement.content,
        isPublished: !announcement.isPublished,
      });
      setAnnouncements((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setPublishingId(null);
    }
  }

  function handleDelete(announcement: Announcement) {
    setConfirmation({
      eyebrow: "Comunicados",
      title: "Excluir comunicado?",
      description: `Deseja excluir o comunicado "${announcement.title}"? Esta acao nao podera ser desfeita.`,
      confirmLabel: "Excluir comunicado",
      confirmingLabel: "Excluindo...",
      variant: "danger",
      onConfirm: () => void confirmDelete(announcement),
    });
  }

  async function confirmDelete(announcement: Announcement) {
    setDeletingId(announcement.id);
    setError(null);

    try {
      await deleteAnnouncement(announcement.id);
      if (announcements.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        refreshAnnouncements();
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
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 xl:flex-row xl:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Portal dos membros
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Comunicados
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Publique avisos que os membros podem acompanhar no portal, sem
            permissao para alterar dados administrativos.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm shadow-sm">
            <span className="text-muted">Publicados</span>
            <strong className="ml-3 text-foreground">{publishedCount}</strong>
          </div>
          <Button type="button" onClick={openCreateModal}>
            <Plus size={17} />
            Novo comunicado
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={refreshAnnouncements}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
              <Megaphone size={18} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Lista de comunicados
              </h2>
              <p className="text-xs text-muted">
                Somente publicados aparecem para os membros
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={refreshAnnouncements}
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
              Carregando comunicados...
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div className="max-w-sm">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-subtle text-foreground">
                <Megaphone size={24} />
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                Nenhum comunicado criado
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Crie o primeiro aviso para deixar o portal dos membros mais
                util no dia a dia.
              </p>
              <Button type="button" className="mt-5" onClick={openCreateModal}>
                <Plus size={17} />
                Criar comunicado
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
              <thead className="border-b border-border bg-surface-subtle text-xs uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Comunicado</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Engajamento</th>
                  <th className="px-4 py-3 font-semibold">Publicado em</th>
                  <th className="px-4 py-3 text-right font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => (
                  <tr
                    key={announcement.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        {announcement.imageUrl ? (
                          <img
                            src={announcement.imageUrl}
                            alt=""
                            className="h-14 w-20 shrink-0 rounded-md border border-border object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                          />
                        ) : null}
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            {announcement.title}
                          </p>
                          <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
                            {getPreview(announcement.content)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${
                          announcement.isPublished
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                            : "border-border bg-surface-subtle text-muted"
                        }`}
                      >
                        {announcement.isPublished ? (
                          <Eye size={13} />
                        ) : (
                          <EyeOff size={13} />
                        )}
                        {announcement.isPublished ? "Publicado" : "Rascunho"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2 text-xs font-semibold text-muted">
                        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-subtle px-2 py-1">
                          <Eye size={13} />
                          {announcement.viewsCount}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-subtle px-2 py-1">
                          <Heart size={13} />
                          {announcement.likesCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted">
                      {formatDate(announcement.publishedAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleTogglePublished(announcement)}
                          disabled={publishingId === announcement.id}
                        >
                          {publishingId === announcement.id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : announcement.isPublished ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                          {announcement.isPublished ? "Recolher" : "Publicar"}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => openEditModal(announcement)}
                        >
                          <Edit3 size={16} />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleDelete(announcement)}
                          disabled={deletingId === announcement.id}
                        >
                          {deletingId === announcement.id ? (
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
        <PaginationControls
          meta={pagination}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
        />
      </section>

      {modalState.isOpen ? (
        <AnnouncementFormModal
          key={
            modalState.mode === "edit" ? modalState.announcement.id : "create"
          }
          mode={modalState.mode}
          announcement={modalState.announcement}
          isSubmitting={isSubmitting}
          error={submitError}
          onClose={closeModal}
          onSubmit={(payload) => void handleSubmit(payload)}
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
