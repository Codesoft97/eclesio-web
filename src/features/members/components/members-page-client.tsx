"use client";

import {
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  UserRound,
  Users,
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
import { formatBrazilianPhone } from "@/lib/formatters/phone";

import { MemberFormModal } from "./member-form-modal";
import {
  createMember,
  deleteMember,
  listMembers,
  updateMember,
} from "../member-service";
import type { Member, MemberPayload } from "../member-types";

type ModalState =
  | { isOpen: false; mode: "create"; member: null }
  | { isOpen: true; mode: "create"; member: null }
  | { isOpen: true; mode: "edit"; member: Member };

type ConfirmationState = Omit<
  ConfirmationModalProps,
  "isConfirming" | "onCancel"
> | null;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

const closedModalState: ModalState = {
  isOpen: false,
  mode: "create",
  member: null,
};

export function MembersPageClient() {
  const router = useRouter();
  const { clearSession } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [modalState, setModalState] = useState<ModalState>(closedModalState);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState>(null);

  useEffect(() => {
    let ignore = false;

    async function loadMembers() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await listMembers();

        if (!ignore) {
          setMembers(data);
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

    void loadMembers();

    return () => {
      ignore = true;
    };
  }, [clearSession, reloadKey, router]);

  function refreshMembers() {
    setReloadKey((current) => current + 1);
  }

  function openCreateModal() {
    setSubmitError(null);
    setModalState({ isOpen: true, mode: "create", member: null });
  }

  function openEditModal(member: Member) {
    setSubmitError(null);
    setModalState({ isOpen: true, mode: "edit", member });
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

  async function handleSubmit(payload: MemberPayload) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (modalState.mode === "edit" && modalState.member) {
        await updateMember(modalState.member.id, payload);
      } else {
        await createMember(payload);
      }

      setModalState(closedModalState);
      refreshMembers();
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setSubmitError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDelete(member: Member) {
    setConfirmation({
      eyebrow: "Exclusão de membro",
      title: "Excluir membro?",
      description: `Deseja excluir o membro ${member.name}? Esta ação não poderá ser desfeita.`,
      confirmLabel: "Excluir membro",
      confirmingLabel: "Excluindo...",
      variant: "danger",
      onConfirm: () => void confirmDelete(member),
    });
  }

  async function confirmDelete(member: Member) {
    setDeletingId(member.id);
    setError(null);

    try {
      await deleteMember(member.id);
      setMembers((current) => current.filter((item) => item.id !== member.id));
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
            Pessoas
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Membros</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Cadastre e mantenha a lista principal de membros da igreja. Por enquanto guardamos nome e WhatsApp.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-lg border border-border bg-surface px-4 py-3 text-sm shadow-sm">
            <span className="text-muted">Total cadastrado</span>
            <strong className="ml-3 text-foreground">{members.length}</strong>
          </div>
          <Button type="button" onClick={openCreateModal}>
            <Plus size={17} />
            Novo membro
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={refreshMembers}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <section className="rounded-xl border border-border bg-surface shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-border p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
              <Users size={18} />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Lista de membros</h2>
              <p className="text-xs text-muted">Dados sincronizados com o backend</p>
            </div>
          </div>
          <Button type="button" variant="ghost" onClick={refreshMembers} disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
            Atualizar
          </Button>
        </div>

        {isLoading ? (
          <div className="grid min-h-64 place-items-center p-8 text-center text-sm text-muted">
            <div>
              <Loader2 className="mx-auto mb-3 animate-spin text-accent" size={24} />
              Carregando membros...
            </div>
          </div>
        ) : members.length === 0 ? (
          <div className="grid min-h-64 place-items-center p-8 text-center">
            <div className="max-w-sm">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-subtle text-foreground">
                <UserRound size={24} />
              </span>
              <h3 className="text-lg font-semibold text-foreground">Nenhum membro cadastrado</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Comece adicionando o primeiro membro. Depois vamos evoluir esta área com filtros, famílias e histórico.
              </p>
              <Button type="button" className="mt-5" onClick={openCreateModal}>
                <Plus size={17} />
                Cadastrar primeiro membro
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead className="border-b border-border bg-surface-subtle text-xs uppercase tracking-[0.14em] text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Nome</th>
                  <th className="px-4 py-3 font-semibold">WhatsApp</th>
                  <th className="px-4 py-3 font-semibold">Cadastro</th>
                  <th className="px-4 py-3 text-right font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {member.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <p className="font-medium text-foreground">{member.name}</p>
                          <p className="font-mono text-xs text-muted">{member.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {formatBrazilianPhone(member.whatsapp)}
                    </td>
                    <td className="px-4 py-4 text-muted">{formatDate(member.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => openEditModal(member)}>
                          <Edit3 size={16} />
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => handleDelete(member)}
                          disabled={deletingId === member.id}
                        >
                          {deletingId === member.id ? (
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
        <MemberFormModal
          key={modalState.mode === "edit" ? modalState.member.id : "create"}
          mode={modalState.mode}
          member={modalState.member}
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

