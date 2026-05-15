"use client";

import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAuth } from "@/features/auth/auth-provider";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";
import {
  DEFAULT_PAGE_SIZE,
  getEmptyPaginationMeta,
  type PaginationMeta,
} from "@/lib/pagination";

import { formatEventDate } from "../member-portal-formatters";
import {
  acceptMyScheduleAssignment,
  declineMyScheduleAssignment,
  listMyScheduleAssignments,
} from "../member-portal-service";
import type {
  MemberPortalScheduleAssignment,
  MemberPortalScheduleStatus,
} from "../member-portal-types";

const statusDetails: Record<
  MemberPortalScheduleStatus,
  {
    label: string;
    icon: typeof CircleDashed;
    className: string;
  }
> = {
  PENDING: {
    label: "Pendente",
    icon: CircleDashed,
    className: "border-accent/40 bg-accent/10 text-foreground",
  },
  ACCEPTED: {
    label: "Aceitou",
    icon: CheckCircle2,
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  DECLINED: {
    label: "Recusou",
    icon: XCircle,
    className: "border-danger/30 bg-danger/10 text-danger",
  },
};

function sortByEventDate(items: MemberPortalScheduleAssignment[]) {
  return [...items].sort(
    (firstItem, secondItem) =>
      new Date(firstItem.event.startsAt).getTime() -
      new Date(secondItem.event.startsAt).getTime(),
  );
}

export function MemberPortalSchedulesPageClient() {
  const router = useRouter();
  const { clearSession } = useAuth();
  const [schedules, setSchedules] = useState<MemberPortalScheduleAssignment[]>(
    [],
  );
  const [pagination, setPagination] = useState<PaginationMeta>(() =>
    getEmptyPaginationMeta(DEFAULT_PAGE_SIZE),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadSchedules() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await listMyScheduleAssignments({
          page: currentPage,
          limit: DEFAULT_PAGE_SIZE,
        });

        if (!ignore) {
          setSchedules(data.items);
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

    void loadSchedules();

    return () => {
      ignore = true;
    };
  }, [clearSession, currentPage, reloadKey, router]);

  const sortedSchedules = useMemo(() => sortByEventDate(schedules), [schedules]);
  const pendingSchedulesCount = useMemo(
    () =>
      schedules.filter((schedule) => schedule.confirmationStatus === "PENDING")
        .length,
    [schedules],
  );

  function refreshSchedules() {
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

  async function handleScheduleResponse(
    assignment: MemberPortalScheduleAssignment,
    action: "accept" | "decline",
  ) {
    setRespondingId(assignment.id);
    setError(null);

    try {
      const updated =
        action === "accept"
          ? await acceptMyScheduleAssignment(assignment.id)
          : await declineMyScheduleAssignment(assignment.id);

      setSchedules((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setRespondingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Portal da igreja
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Minhas escalas
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Confirme sua participacao nos eventos em que voce foi escalado.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={refreshSchedules}
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

      {error ? (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={refreshSchedules}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
              <CheckCircle2 size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Escalas vinculadas
              </h2>
              <p className="text-sm leading-6 text-muted">
                Apenas as suas escalas aparecem aqui.
              </p>
            </div>
          </div>
          <span className="rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-xs font-semibold text-foreground">
            {pendingSchedulesCount} pendente(s)
          </span>
        </div>

        {isLoading ? (
          <div className="grid min-h-64 place-items-center text-sm text-muted">
            <div>
              <Loader2
                className="mx-auto mb-3 animate-spin text-accent"
                size={24}
              />
              Carregando escalas...
            </div>
          </div>
        ) : sortedSchedules.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-subtle p-6 text-center text-sm text-muted">
            Nenhuma escala vinculada ao seu acesso.
          </div>
        ) : (
          <div className="grid gap-3">
            {sortedSchedules.map((assignment) => {
              const status = statusDetails[assignment.confirmationStatus];
              const StatusIcon = status.icon;
              const isResponding = respondingId === assignment.id;

              return (
                <article
                  key={assignment.id}
                  className="rounded-lg border border-border bg-surface-subtle p-4"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                        {formatEventDate(assignment.event.startsAt)}
                      </p>
                      <h3 className="mt-2 font-semibold text-foreground">
                        {assignment.event.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {assignment.ministry.name} / {assignment.role.name}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${status.className}`}
                    >
                      <StatusIcon size={13} />
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {assignment.confirmationStatus !== "ACCEPTED" ? (
                      <Button
                        type="button"
                        onClick={() =>
                          void handleScheduleResponse(assignment, "accept")
                        }
                        disabled={isResponding}
                      >
                        {isResponding ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Aceitar
                      </Button>
                    ) : null}
                    {assignment.confirmationStatus !== "DECLINED" ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          void handleScheduleResponse(assignment, "decline")
                        }
                        disabled={isResponding}
                      >
                        {isResponding ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <XCircle size={16} />
                        )}
                        Recusar
                      </Button>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <PaginationControls
          meta={pagination}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
        />
      </section>
    </div>
  );
}
