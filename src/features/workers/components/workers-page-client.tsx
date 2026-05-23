"use client";

import {
  BadgePlus,
  Edit3,
  Landmark,
  Loader2,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Trash2,
  UserCog,
  UsersRound,
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
import { MemberAccessInvitationModal } from "@/features/members/components/member-access-invitation-modal";
import { createMemberAccessInvitation } from "@/features/members/member-service";
import type { MemberAccessInvitation } from "@/features/members/member-types";
import { hasCompletePlan } from "@/features/subscriptions/subscription-features";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";
import { formatBrazilianPhone } from "@/lib/formatters/phone";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  getEmptyPaginationMeta,
  type NameOrCreatedAtSort,
  type PaginationMeta,
} from "@/lib/pagination";

import { MinistryFormModal } from "./ministry-form-modal";
import { RoleFormModal } from "./role-form-modal";
import { WorkerFormModal } from "./worker-form-modal";
import {
  createWorker,
  createWorkerMinistry,
  createWorkerRole,
  deleteWorker,
  deleteWorkerMinistry,
  deleteWorkerRole,
  listWorkerMinistries,
  listWorkers,
  updateWorker,
  updateWorkerMinistry,
  updateWorkerRole,
} from "../worker-service";
import type {
  CreateWorkerMinistryPayload,
  CreateWorkerPayload,
  CreateWorkerRolePayload,
  UpdateWorkerMinistryPayload,
  UpdateWorkerPayload,
  UpdateWorkerRolePayload,
  Worker,
  WorkerMinistry,
  WorkerRole,
} from "../worker-types";

type WorkerModalState =
  | { isOpen: false; mode: "create"; worker: null }
  | { isOpen: true; mode: "create"; worker: null }
  | { isOpen: true; mode: "edit"; worker: Worker };

type MinistryModalState =
  | { isOpen: false; mode: "create"; ministry: null }
  | { isOpen: true; mode: "create"; ministry: null }
  | { isOpen: true; mode: "edit"; ministry: WorkerMinistry };

type RoleModalState =
  | { isOpen: false; mode: "create"; role: null; initialMinistryId: string }
  | { isOpen: true; mode: "create"; role: null; initialMinistryId: string }
  | { isOpen: true; mode: "edit"; role: WorkerRole; initialMinistryId: string };

type ConfirmationState = Omit<
  ConfirmationModalProps,
  "isConfirming" | "onCancel"
> | null;

type PortalAccessStatus = Worker["portalAccessStatus"];

const closedWorkerModal: WorkerModalState = {
  isOpen: false,
  mode: "create",
  worker: null,
};

const closedMinistryModal: MinistryModalState = {
  isOpen: false,
  mode: "create",
  ministry: null,
};

const closedRoleModal: RoleModalState = {
  isOpen: false,
  mode: "create",
  role: null,
  initialMinistryId: "",
};

const sortOptions: Array<{ value: NameOrCreatedAtSort; label: string }> = [
  { value: "name_asc", label: "Nome A-Z" },
  { value: "created_at_desc", label: "Mais recentes" },
  { value: "created_at_asc", label: "Mais antigos" },
];

function getPortalAccessLabel(status: PortalAccessStatus) {
  if (status === "ACTIVE") {
    return "Portal ativo";
  }

  if (status === "INACTIVE") {
    return "Portal inativo";
  }

  return "Sem acesso";
}

function getPortalAccessClassName(status: PortalAccessStatus) {
  if (status === "ACTIVE") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  }

  if (status === "INACTIVE") {
    return "border-danger/30 bg-danger/10 text-danger";
  }

  return "border-border bg-surface-subtle text-muted";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function countRoles(ministries: WorkerMinistry[]) {
  return ministries.reduce((total, ministry) => total + ministry.roles.length, 0);
}

export function WorkersPageClient() {
  const router = useRouter();
  const { session, clearSession } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [ministries, setMinistries] = useState<WorkerMinistry[]>([]);
  const [workersPagination, setWorkersPagination] = useState<PaginationMeta>(
    () => getEmptyPaginationMeta(DEFAULT_PAGE_SIZE),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState<NameOrCreatedAtSort>("name_asc");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [workerModal, setWorkerModal] =
    useState<WorkerModalState>(closedWorkerModal);
  const [ministryModal, setMinistryModal] =
    useState<MinistryModalState>(closedMinistryModal);
  const [roleModal, setRoleModal] = useState<RoleModalState>(closedRoleModal);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitingWorkerId, setInvitingWorkerId] = useState<string | null>(null);
  const [invitation, setInvitation] =
    useState<MemberAccessInvitation | null>(null);
  const [deletingWorkerId, setDeletingWorkerId] = useState<string | null>(null);
  const [deletingMinistryId, setDeletingMinistryId] = useState<string | null>(
    null,
  );
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState>(null);
  const canInviteToPortal = hasCompletePlan(session?.subscription);

  useEffect(() => {
    let ignore = false;

    async function loadWorkers() {
      setIsLoading(true);
      setError(null);

      try {
        const [ministriesData, workersData] = await Promise.all([
          listWorkerMinistries({ limit: MAX_PAGE_SIZE }),
          listWorkers({ page: currentPage, limit: DEFAULT_PAGE_SIZE, sort }),
        ]);

        if (!ignore) {
          setMinistries(ministriesData.items);
          setWorkers(workersData.items);
          setWorkersPagination(workersData.meta);
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

    void loadWorkers();

    return () => {
      ignore = true;
    };
  }, [clearSession, currentPage, reloadKey, router, sort]);

  function refreshWorkers() {
    setReloadKey((current) => current + 1);
  }

  function handleSortChange(nextSort: NameOrCreatedAtSort) {
    setCurrentPage(1);
    setSort(nextSort);
  }

  function openCreateWorkerModal() {
    setSubmitError(null);
    setWorkerModal({ isOpen: true, mode: "create", worker: null });
  }

  function openEditWorkerModal(worker: Worker) {
    setSubmitError(null);
    setWorkerModal({ isOpen: true, mode: "edit", worker });
  }

  function openCreateMinistryModal() {
    setSubmitError(null);
    setMinistryModal({ isOpen: true, mode: "create", ministry: null });
  }

  function openEditMinistryModal(ministry: WorkerMinistry) {
    setSubmitError(null);
    setMinistryModal({ isOpen: true, mode: "edit", ministry });
  }

  function openCreateRoleModal(ministryId = ministries[0]?.id ?? "") {
    setSubmitError(null);
    setRoleModal({
      isOpen: true,
      mode: "create",
      role: null,
      initialMinistryId: ministryId,
    });
  }

  function openEditRoleModal(role: WorkerRole) {
    setSubmitError(null);
    setRoleModal({
      isOpen: true,
      mode: "edit",
      role,
      initialMinistryId: role.ministryId,
    });
  }

  function closeModals() {
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setWorkerModal(closedWorkerModal);
    setMinistryModal(closedMinistryModal);
    setRoleModal(closedRoleModal);
  }

  async function handleUnauthorized(err: unknown) {
    if (!isUnauthorizedApiError(err)) {
      return false;
    }

    clearSession();
    router.push("/login");
    return true;
  }

  async function handleWorkerSubmit(
    payload: CreateWorkerPayload | UpdateWorkerPayload,
  ) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (workerModal.mode === "edit" && workerModal.worker) {
        await updateWorker(workerModal.worker.id, payload as UpdateWorkerPayload);
      } else {
        await createWorker(payload as CreateWorkerPayload);
      }

      setWorkerModal(closedWorkerModal);
      if (workerModal.mode === "create") {
        setCurrentPage(1);
      }
      refreshWorkers();
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setSubmitError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMinistrySubmit(
    payload: CreateWorkerMinistryPayload | UpdateWorkerMinistryPayload,
  ) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (ministryModal.mode === "edit" && ministryModal.ministry) {
        await updateWorkerMinistry(
          ministryModal.ministry.id,
          payload as UpdateWorkerMinistryPayload,
        );
      } else {
        await createWorkerMinistry(payload as CreateWorkerMinistryPayload);
      }

      setMinistryModal(closedMinistryModal);
      refreshWorkers();
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setSubmitError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRoleSubmit(
    payload: CreateWorkerRolePayload | UpdateWorkerRolePayload,
  ) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (roleModal.mode === "edit" && roleModal.role) {
        await updateWorkerRole(
          roleModal.role.id,
          payload as UpdateWorkerRolePayload,
        );
      } else {
        await createWorkerRole(payload as CreateWorkerRolePayload);
      }

      setRoleModal(closedRoleModal);
      refreshWorkers();
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setSubmitError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateInvitation(worker: Worker) {
    if (!canInviteToPortal) {
      setError("Convites para o portal estao disponiveis no plano completo.");
      return;
    }

    if (!worker.memberId) {
      setError(
        "Este obreiro ainda nao possui membro vinculado para receber convite.",
      );
      return;
    }

    setInvitingWorkerId(worker.id);
    setError(null);

    try {
      const data = await createMemberAccessInvitation(worker.memberId);
      setInvitation(data);
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setInvitingWorkerId(null);
    }
  }

  function handleDeleteWorker(worker: Worker) {
    setConfirmation({
      eyebrow: "Exclusão de obreiro",
      title: "Excluir obreiro?",
      description: `Deseja excluir o obreiro ${worker.name}? Esta ação não poderá ser desfeita.`,
      confirmLabel: "Excluir obreiro",
      confirmingLabel: "Excluindo...",
      variant: "danger",
      onConfirm: () => void confirmDeleteWorker(worker),
    });
  }

  async function confirmDeleteWorker(worker: Worker) {
    setDeletingWorkerId(worker.id);
    setError(null);

    try {
      await deleteWorker(worker.id);
      if (workers.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        refreshWorkers();
      }
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setDeletingWorkerId(null);
      setConfirmation(null);
    }
  }

  function handleDeleteMinistry(ministry: WorkerMinistry) {
    setConfirmation({
      eyebrow: "Exclusão de ministério",
      title: "Excluir ministério?",
      description: `Deseja excluir o ministério ${ministry.name}? As funções vinculadas também serão excluídas se não houver obreiros vinculados.`,
      confirmLabel: "Excluir ministério",
      confirmingLabel: "Excluindo...",
      variant: "danger",
      onConfirm: () => void confirmDeleteMinistry(ministry),
    });
  }

  async function confirmDeleteMinistry(ministry: WorkerMinistry) {
    setDeletingMinistryId(ministry.id);
    setError(null);

    try {
      await deleteWorkerMinistry(ministry.id);
      refreshWorkers();
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setDeletingMinistryId(null);
      setConfirmation(null);
    }
  }

  function handleDeleteRole(role: WorkerRole) {
    setConfirmation({
      eyebrow: "Exclusão de função",
      title: "Excluir função?",
      description: `Deseja excluir a função ${role.name}? Ela não poderá ser removida se houver obreiros vinculados.`,
      confirmLabel: "Excluir função",
      confirmingLabel: "Excluindo...",
      variant: "danger",
      onConfirm: () => void confirmDeleteRole(role),
    });
  }

  async function confirmDeleteRole(role: WorkerRole) {
    setDeletingRoleId(role.id);
    setError(null);

    try {
      await deleteWorkerRole(role.id);
      refreshWorkers();
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setDeletingRoleId(null);
      setConfirmation(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:mb-8 sm:pb-6 xl:flex-row xl:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Serviço
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Obreiros
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Gerencie obreiros, ministérios e funções. Esta base será usada depois para montar as escalas.
          </p>
        </div>

        <div className="grid gap-3 sm:flex sm:items-center">
          <Button type="button" variant="ghost" onClick={openCreateMinistryModal}>
            <Landmark size={17} />
            Novo ministério
          </Button>
          <Button type="button" onClick={openCreateWorkerModal}>
            <Plus size={17} />
            Novo obreiro
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 grid gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:flex sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={refreshWorkers}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-border bg-primary p-5 text-primary-foreground shadow-sm dark:bg-surface dark:text-foreground">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-medium opacity-75">Obreiros cadastrados</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <UsersRound size={17} />
            </span>
          </div>
          <p className="text-3xl font-semibold">
            {workersPagination.totalItems}
          </p>
        </article>

        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-medium text-muted">Ministérios</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
              <Landmark size={17} />
            </span>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {ministries.length}
          </p>
        </article>

        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-medium text-muted">Funções</p>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle text-accent">
              <ShieldCheck size={17} />
            </span>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {countRoles(ministries)}
          </p>
        </article>
      </section>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_24rem]">
        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="grid gap-4 border-b border-border p-4 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
                <UserCog size={18} />
              </span>
              <div>
                <h2 className="text-base font-semibold text-foreground sm:text-lg">
                  Lista de obreiros
                </h2>
              </div>
            </div>
            <div className="grid gap-3 sm:flex sm:items-center">
              <label className="grid gap-1 text-xs font-medium text-muted sm:min-w-44">
                <span>Ordenar</span>
                <select
                  className="h-10 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-foreground transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  value={sort}
                  onChange={(event) =>
                    handleSortChange(event.target.value as NameOrCreatedAtSort)
                  }
                  disabled={isLoading}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="button"
                variant="ghost"
                onClick={refreshWorkers}
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
                Carregando obreiros...
              </div>
            </div>
          ) : workers.length === 0 ? (
            <div className="grid min-h-72 place-items-center p-8 text-center">
              <div className="max-w-sm">
                <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-subtle text-foreground">
                  <UserCog size={24} />
                </span>
                <h3 className="text-lg font-semibold text-foreground">
                  Nenhum obreiro cadastrado
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Cadastre o primeiro obreiro vinculando ministério e função. Depois vamos usar isso nas escalas.
                </p>
                <Button type="button" className="mt-5" onClick={openCreateWorkerModal}>
                  <Plus size={17} />
                  Cadastrar obreiro
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-3 p-3 md:hidden">
                {workers.map((worker) => (
                  <article
                    key={worker.id}
                    className="rounded-lg border border-border bg-surface-subtle p-4"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          {worker.name}
                        </h3>
                        <p className="mt-1 text-sm text-muted">
                          {formatBrazilianPhone(worker.whatsapp)}
                        </p>
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {worker.name.slice(0, 1).toUpperCase()}
                      </span>
                    </div>

                    <div className="mb-4 grid gap-2 text-sm">
                      <div className="flex items-center justify-between border border-border bg-surface px-3 py-2">
                        <span className="text-muted">Ministério</span>
                        <strong className="text-foreground">{worker.ministry.name}</strong>
                      </div>
                      <div className="flex items-center justify-between border border-border bg-surface px-3 py-2">
                        <span className="text-muted">Função</span>
                        <strong className="text-foreground">{worker.role.name}</strong>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                      {worker.hasPortalAccess ? (
                        <span
                          className={`inline-flex min-h-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold ${getPortalAccessClassName(
                            worker.portalAccessStatus,
                          )}`}
                        >
                          {getPortalAccessLabel(worker.portalAccessStatus)}
                        </span>
                      ) : worker.memberId && canInviteToPortal ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleCreateInvitation(worker)}
                          disabled={invitingWorkerId === worker.id}
                        >
                          {invitingWorkerId === worker.id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Send size={16} />
                          )}
                          Convidar
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => openEditWorkerModal(worker)}
                      >
                        <Edit3 size={16} />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => handleDeleteWorker(worker)}
                        disabled={deletingWorkerId === worker.id}
                      >
                        {deletingWorkerId === worker.id ? (
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
                <table className="w-full min-w-[840px] border-collapse text-left text-sm">
                  <thead className="border-b border-border bg-surface-subtle text-xs uppercase tracking-[0.14em] text-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Nome</th>
                      <th className="px-4 py-3 font-semibold">Whatsapp</th>
                      <th className="px-4 py-3 font-semibold">Ministério</th>
                      <th className="px-4 py-3 font-semibold">Função</th>
                      <th className="px-4 py-3 font-semibold">Cadastro</th>
                      <th className="px-4 py-3 text-right font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((worker) => (
                      <tr
                        key={worker.id}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                              {worker.name.slice(0, 1).toUpperCase()}
                            </span>
                            <div>
                              <p className="font-medium text-foreground">{worker.name}</p>
                              <p className="font-mono text-xs text-muted">
                                {worker.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-foreground">
                          {formatBrazilianPhone(worker.whatsapp)}
                        </td>
                        <td className="px-4 py-4 text-foreground">
                          {worker.ministry.name}
                        </td>
                        <td className="px-4 py-4 text-foreground">
                          {worker.role.name}
                        </td>
                        <td className="px-4 py-4 text-muted">
                          {formatDate(worker.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            {worker.hasPortalAccess ? (
                              <span
                                className={`inline-flex min-h-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold ${getPortalAccessClassName(
                                  worker.portalAccessStatus,
                                )}`}
                              >
                                {getPortalAccessLabel(
                                  worker.portalAccessStatus,
                                )}
                              </span>
                            ) : worker.memberId && canInviteToPortal ? (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                  void handleCreateInvitation(worker)
                                }
                                disabled={invitingWorkerId === worker.id}
                              >
                                {invitingWorkerId === worker.id ? (
                                  <Loader2 className="animate-spin" size={16} />
                                ) : (
                                  <Send size={16} />
                                )}
                                Convidar
                              </Button>
                            ) : null}
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => openEditWorkerModal(worker)}
                            >
                              <Edit3 size={16} />
                              Editar
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              onClick={() => handleDeleteWorker(worker)}
                              disabled={deletingWorkerId === worker.id}
                            >
                              {deletingWorkerId === worker.id ? (
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
            meta={workersPagination}
            isLoading={isLoading}
            onPageChange={setCurrentPage}
          />
        </section>

        <aside className="rounded-xl border border-border bg-surface shadow-sm xl:sticky xl:top-5 xl:self-start">
          <div className="grid gap-3 border-b border-border p-4 sm:flex sm:items-center sm:justify-between xl:grid xl:items-start">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                Ministérios
              </p>
              <h2 className="mt-2 text-lg font-semibold text-foreground">
                Funções por área
              </h2>
              <p className="mt-1 text-sm text-muted">
                Personalize a estrutura da igreja.
              </p>
            </div>
            <Button type="button" variant="ghost" onClick={() => openCreateRoleModal()}>
              <BadgePlus size={16} />
              Nova função
            </Button>
          </div>

          <div className="grid gap-3 p-3 sm:p-4">
            {ministries.map((ministry) => (
              <article
                key={ministry.id}
                className="rounded-lg border border-border bg-surface-subtle p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{ministry.name}</h3>
                    <p className="mt-1 text-xs text-muted">
                      {ministry.roles.length} funções
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface text-muted transition-all duration-200 hover:border-accent hover:text-foreground"
                      onClick={() => openEditMinistryModal(ministry)}
                      aria-label={`Editar ministério ${ministry.name}`}
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-danger/40 bg-surface text-danger transition-all duration-200 hover:bg-danger hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => handleDeleteMinistry(ministry)}
                      disabled={deletingMinistryId === ministry.id}
                      aria-label={`Excluir ministério ${ministry.name}`}
                    >
                      {deletingMinistryId === ministry.id ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ministry.roles.map((role) => (
                    <span
                      key={role.id}
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1 text-xs font-medium text-foreground"
                    >
                      {role.name}
                      <button
                        type="button"
                        className="cursor-pointer text-muted transition hover:text-foreground"
                        onClick={() => openEditRoleModal(role)}
                        aria-label={`Editar função ${role.name}`}
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer text-danger transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        onClick={() => handleDeleteRole(role)}
                        disabled={deletingRoleId === role.id}
                        aria-label={`Excluir função ${role.name}`}
                      >
                        {deletingRoleId === role.id ? (
                          <Loader2 className="animate-spin" size={12} />
                        ) : (
                          <Trash2 size={12} />
                        )}
                      </button>
                    </span>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="mt-3 h-9 w-full"
                  onClick={() => openCreateRoleModal(ministry.id)}
                >
                  <BadgePlus size={15} />
                  Adicionar função
                </Button>
              </article>
            ))}
          </div>
        </aside>
      </div>

      {workerModal.isOpen ? (
        <WorkerFormModal
          key={workerModal.mode === "edit" ? workerModal.worker.id : "create"}
          mode={workerModal.mode}
          worker={workerModal.worker}
          ministries={ministries}
          isSubmitting={isSubmitting}
          error={submitError}
          onClose={closeModals}
          onSubmit={(payload) => void handleWorkerSubmit(payload)}
        />
      ) : null}

      {ministryModal.isOpen ? (
        <MinistryFormModal
          key={
            ministryModal.mode === "edit" ? ministryModal.ministry.id : "create"
          }
          mode={ministryModal.mode}
          ministry={ministryModal.ministry}
          isSubmitting={isSubmitting}
          error={submitError}
          onClose={closeModals}
          onSubmit={(payload) => void handleMinistrySubmit(payload)}
        />
      ) : null}

      {roleModal.isOpen ? (
        <RoleFormModal
          key={roleModal.mode === "edit" ? roleModal.role.id : "create"}
          mode={roleModal.mode}
          role={roleModal.role}
          ministries={ministries}
          initialMinistryId={roleModal.initialMinistryId}
          isSubmitting={isSubmitting}
          error={submitError}
          onClose={closeModals}
          onSubmit={(payload) => void handleRoleSubmit(payload)}
        />
      ) : null}

      {invitation ? (
        <MemberAccessInvitationModal
          invitation={invitation}
          onClose={() => setInvitation(null)}
        />
      ) : null}

      {confirmation ? (
        <ConfirmationModal
          {...confirmation}
          isConfirming={Boolean(
            deletingWorkerId || deletingMinistryId || deletingRoleId,
          )}
          onCancel={() => setConfirmation(null)}
        />
      ) : null}
    </div>
  );
}
