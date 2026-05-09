"use client";

import { FormEvent, useMemo, useState } from "react";
import { Loader2, Plus, Save, Trash2, UserCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatBrazilianPhone } from "@/lib/formatters/phone";
import type { Worker, WorkerMinistry } from "@/features/workers/worker-types";

import type {
  ChurchEvent,
  EventSchedule,
  EventScheduleAssignmentPayload,
  EventSchedulePayload,
} from "../event-types";

interface EventScheduleModalProps {
  event: ChurchEvent;
  schedule: EventSchedule | null;
  ministries: WorkerMinistry[];
  workers: Worker[];
  isLoading: boolean;
  isSubmitting: boolean;
  deletingAssignmentId: string | null;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: EventSchedulePayload) => void;
  onDeleteAssignment: (assignmentId: string) => void;
}

type ScheduleFormAssignment = EventScheduleAssignmentPayload & {
  localId: string;
  persistedId?: string;
};

function createLocalId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildFormAssignments(
  schedule: EventSchedule | null,
): ScheduleFormAssignment[] {
  return (
    schedule?.assignments.map((assignment) => ({
      localId: assignment.id,
      persistedId: assignment.id,
      ministryId: assignment.ministryId,
      roleId: assignment.roleId,
      workerId: assignment.workerId,
    })) ?? []
  );
}

function buildEmptyAssignment(
  ministries: WorkerMinistry[],
  workers: Worker[],
): ScheduleFormAssignment {
  const firstMinistry = ministries[0];
  const firstRole = firstMinistry?.roles[0];
  const firstWorker = workers.find(
    (worker) =>
      worker.ministryId === firstMinistry?.id && worker.roleId === firstRole?.id,
  );

  return {
    localId: createLocalId(),
    ministryId: firstMinistry?.id ?? "",
    roleId: firstRole?.id ?? "",
    workerId: firstWorker?.id ?? "",
  };
}

export function EventScheduleModal({
  event,
  schedule,
  ministries,
  workers,
  isLoading,
  isSubmitting,
  deletingAssignmentId,
  error,
  onClose,
  onSubmit,
  onDeleteAssignment,
}: EventScheduleModalProps) {
  const [assignments, setAssignments] = useState<ScheduleFormAssignment[]>(() =>
    buildFormAssignments(schedule),
  );
  const [localError, setLocalError] = useState<string | null>(null);



  const workersById = useMemo(
    () => new Map(workers.map((worker) => [worker.id, worker])),
    [workers],
  );

  function getRoles(ministryId: string) {
    return ministries.find((ministry) => ministry.id === ministryId)?.roles ?? [];
  }

  function getAvailableWorkers(ministryId: string, roleId: string) {
    return workers.filter(
      (worker) => worker.ministryId === ministryId && worker.roleId === roleId,
    );
  }

  function addAssignment() {
    setLocalError(null);
    setAssignments((current) => [
      ...current,
      buildEmptyAssignment(ministries, workers),
    ]);
  }

  function removeAssignment(assignment: ScheduleFormAssignment) {
    setLocalError(null);

    if (assignment.persistedId) {
      onDeleteAssignment(assignment.persistedId);
      return;
    }

    setAssignments((current) =>
      current.filter((item) => item.localId !== assignment.localId),
    );
  }

  function updateAssignment(
    localId: string,
    field: keyof EventScheduleAssignmentPayload,
    value: string,
  ) {
    setLocalError(null);
    setAssignments((current) =>
      current.map((assignment) => {
        if (assignment.localId !== localId) {
          return assignment;
        }

        if (field === "ministryId") {
          const firstRole = getRoles(value)[0];
          const firstWorker = workers.find(
            (worker) =>
              worker.ministryId === value && worker.roleId === firstRole?.id,
          );

          return {
            ...assignment,
            ministryId: value,
            roleId: firstRole?.id ?? "",
            workerId: firstWorker?.id ?? "",
          };
        }

        if (field === "roleId") {
          const firstWorker = workers.find(
            (worker) =>
              worker.ministryId === assignment.ministryId &&
              worker.roleId === value,
          );

          return {
            ...assignment,
            roleId: value,
            workerId: firstWorker?.id ?? "",
          };
        }

        return {
          ...assignment,
          [field]: value,
        };
      }),
    );
  }

  function handleSubmit(eventSubmit: FormEvent<HTMLFormElement>) {
    eventSubmit.preventDefault();
    setLocalError(null);

    const payloadAssignments = assignments.map(
      ({ ministryId, roleId, workerId }) => ({
        ministryId,
        roleId,
        workerId,
      }),
    );

    const hasMissingFields = payloadAssignments.some(
      (assignment) =>
        !assignment.ministryId || !assignment.roleId || !assignment.workerId,
    );

    if (hasMissingFields) {
      setLocalError("Preencha ministerio, funcao e obreiro em todos os itens.");
      return;
    }

    const workerIds = new Set<string>();

    for (const assignment of payloadAssignments) {
      if (workerIds.has(assignment.workerId)) {
        setLocalError("O mesmo obreiro nao pode aparecer duas vezes na escala.");
        return;
      }

      workerIds.add(assignment.workerId);
    }

    onSubmit({ assignments: payloadAssignments });
  }

  const hasWorkerBase = ministries.length > 0 && workers.length > 0;

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-foreground/25 px-3 py-4 backdrop-blur-sm sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-schedule-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-y-auto border border-border bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Escala de obreiros
            </p>
            <h2
              id="event-schedule-title"
              className="mt-2 text-2xl font-semibold text-foreground"
            >
              {event.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Monte a escala desta ocorrencia especifica do evento.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border border-border text-muted transition hover:border-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Fechar modal"
            disabled={isSubmitting}
          >
            <X size={18} />
          </button>
        </div>

        {isLoading ? (
          <div className="grid min-h-72 place-items-center p-8 text-sm text-muted">
            <div>
              <Loader2 className="mx-auto mb-3 animate-spin text-accent" size={24} />
              Carregando escala...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-4 p-5">
            {!hasWorkerBase ? (
              <div className="border border-dashed border-border bg-surface-subtle p-5 text-sm leading-6 text-muted">
                Cadastre ministerios, funcoes e obreiros antes de montar uma
                escala. Depois volte aqui para vincular cada funcao ao obreiro
                responsavel.
              </div>
            ) : null}

            <div className="grid gap-3">
              {assignments.length === 0 ? (
                <div className="border border-dashed border-border bg-surface-subtle p-6 text-center">
                  <UserCheck className="mx-auto mb-3 text-muted" size={26} />
                  <h3 className="text-base font-semibold text-foreground">
                    Nenhum obreiro escalado
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Adicione os obreiros que servirao neste evento.
                  </p>
                </div>
              ) : (
                assignments.map((assignment, index) => {
                  const roles = getRoles(assignment.ministryId);
                  const availableWorkers = getAvailableWorkers(
                    assignment.ministryId,
                    assignment.roleId,
                  );
                  const selectedWorker = workersById.get(assignment.workerId);
                  const isDeleting = deletingAssignmentId === assignment.persistedId;

                  return (
                    <div
                      key={assignment.localId}
                      className="grid gap-3 border border-border bg-surface-subtle p-4 xl:grid-cols-[1fr_1fr_1.4fr_auto] xl:items-end"
                    >
                      <label className="grid gap-2 text-sm font-medium text-foreground">
                        <span>Ministerio #{index + 1}</span>
                        <select
                          className="h-11 cursor-pointer border border-border bg-surface px-3 text-sm text-foreground transition focus:border-accent focus:outline-none"
                          value={assignment.ministryId}
                          onChange={(eventChange) =>
                            updateAssignment(
                              assignment.localId,
                              "ministryId",
                              eventChange.target.value,
                            )
                          }
                          disabled={isSubmitting || isDeleting}
                          required
                        >
                          <option value="">Selecione</option>
                          {ministries.map((ministry) => (
                            <option key={ministry.id} value={ministry.id}>
                              {ministry.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="grid gap-2 text-sm font-medium text-foreground">
                        <span>Funcao</span>
                        <select
                          className="h-11 cursor-pointer border border-border bg-surface px-3 text-sm text-foreground transition focus:border-accent focus:outline-none"
                          value={assignment.roleId}
                          onChange={(eventChange) =>
                            updateAssignment(
                              assignment.localId,
                              "roleId",
                              eventChange.target.value,
                            )
                          }
                          disabled={isSubmitting || isDeleting}
                          required
                        >
                          <option value="">Selecione</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="grid gap-2 text-sm font-medium text-foreground">
                        <span>Obreiro</span>
                        <select
                          className="h-11 cursor-pointer border border-border bg-surface px-3 text-sm text-foreground transition focus:border-accent focus:outline-none"
                          value={assignment.workerId}
                          onChange={(eventChange) =>
                            updateAssignment(
                              assignment.localId,
                              "workerId",
                              eventChange.target.value,
                            )
                          }
                          disabled={isSubmitting || isDeleting}
                          required
                        >
                          <option value="">Selecione</option>
                          {availableWorkers.map((worker) => (
                            <option key={worker.id} value={worker.id}>
                              {worker.name} - {formatBrazilianPhone(worker.whatsapp)}
                            </option>
                          ))}
                        </select>
                        {assignment.roleId && availableWorkers.length === 0 ? (
                          <span className="text-xs text-muted">
                            Nenhum obreiro cadastrado para esta funcao.
                          </span>
                        ) : selectedWorker ? (
                          <span className="text-xs text-muted">
                            {selectedWorker.ministry.name} / {selectedWorker.role.name}
                          </span>
                        ) : null}
                      </label>

                      <Button
                        type="button"
                        variant="danger"
                        className="h-11 xl:mb-0"
                        onClick={() => removeAssignment(assignment)}
                        disabled={isSubmitting || isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        Remover
                      </Button>
                    </div>
                  );
                })
              )}
            </div>

            {localError || error ? (
              <p className="border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                {localError ?? error}
              </p>
            ) : null}

            <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <Button
                type="button"
                variant="ghost"
                onClick={addAssignment}
                disabled={!hasWorkerBase || isSubmitting}
              >
                <Plus size={17} />
                Adicionar obreiro
              </Button>
              <p className="text-xs leading-5 text-muted">
                Salvar substitui a escala atual pela lista acima. Para limpar a
                escala, remova todos os itens e salve.
              </p>
              <Button type="submit" disabled={isSubmitting}>
                <Save size={17} />
                {isSubmitting ? "Salvando..." : "Salvar escala"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
