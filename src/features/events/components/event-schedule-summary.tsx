"use client";

import {
  BellRing,
  Check,
  CheckCircle2,
  CircleDashed,
  Copy,
  Loader2,
  Send,
  Trash2,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import { formatBrazilianPhone } from "@/lib/formatters/phone";

import type {
  EventSchedule,
  EventScheduleAssignment,
  EventScheduleConfirmationStatus,
} from "../event-types";

interface EventScheduleSummaryProps {
  schedule: EventSchedule | null | undefined;
  isLoading?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  eventTitle?: string;
  eventStartsAt?: string;
  showConfirmationActions?: boolean;
  deletingAssignmentId?: string | null;
  onDeleteAssignment?: (assignment: EventScheduleAssignment) => void;
}

type GroupedSchedule = {
  ministryId: string;
  ministryName: string;
  roles: {
    roleId: string;
    roleName: string;
    assignments: EventScheduleAssignment[];
  }[];
};

type CopiedTarget = {
  assignmentId: string;
  target: "link";
} | null;

const statusDetails: Record<
  EventScheduleConfirmationStatus,
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
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  DECLINED: {
    label: "Recusou",
    icon: XCircle,
    className: "border-danger/30 bg-danger/10 text-danger",
  },
};

function groupAssignments(assignments: EventScheduleAssignment[]) {
  const groups: GroupedSchedule[] = [];

  for (const assignment of assignments) {
    let ministryGroup = groups.find(
      (group) => group.ministryId === assignment.ministryId,
    );

    if (!ministryGroup) {
      ministryGroup = {
        ministryId: assignment.ministryId,
        ministryName: assignment.ministry.name,
        roles: [],
      };
      groups.push(ministryGroup);
    }

    let roleGroup = ministryGroup.roles.find(
      (group) => group.roleId === assignment.roleId,
    );

    if (!roleGroup) {
      roleGroup = {
        roleId: assignment.roleId,
        roleName: assignment.role.name,
        assignments: [],
      };
      ministryGroup.roles.push(roleGroup);
    }

    roleGroup.assignments.push(assignment);
  }

  return groups;
}

function formatEventDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildConfirmationMessage({
  assignment,
  eventTitle,
  eventStartsAt,
}: {
  assignment: EventScheduleAssignment;
  eventTitle?: string;
  eventStartsAt?: string;
}) {
  return [
    `Olá, ${assignment.worker.name}! Você foi escalado(a) para servir.`,
    eventTitle ? `Evento: ${eventTitle}` : null,
    eventStartsAt ? `Data e hora: ${formatEventDateTime(eventStartsAt)}` : null,
    `Ministério: ${assignment.ministry.name}`,
    `Função: ${assignment.role.name}`,
    "",
    "Confirme se você poderá comparecer pelo link:",
    assignment.confirmationUrl,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildWhatsappUrl(
  assignment: EventScheduleAssignment,
  eventTitle?: string,
  eventStartsAt?: string,
) {
  const message = buildConfirmationMessage({
    assignment,
    eventTitle,
    eventStartsAt,
  });
  const digits = assignment.worker.whatsapp.replace(/\D/g, "");
  const normalizedPhone = digits.startsWith("55") ? digits : `55${digits}`;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
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

export function EventScheduleSummary({
  schedule,
  isLoading = false,
  compact = false,
  emptyMessage = "Nenhum obreiro escalado.",
  eventTitle,
  eventStartsAt,
  showConfirmationActions = true,
  deletingAssignmentId = null,
  onDeleteAssignment,
}: EventScheduleSummaryProps) {
  const [copied, setCopied] = useState<CopiedTarget>(null);

  async function handleCopyLink(assignment: EventScheduleAssignment) {
    await copyText(assignment.confirmationUrl);
    setCopied({ assignmentId: assignment.id, target: "link" });
    window.setTimeout(() => setCopied(null), 1800);
  }

  function handleOpenWhatsapp(assignment: EventScheduleAssignment) {
    window.open(
      buildWhatsappUrl(assignment, eventTitle, eventStartsAt),
      "_blank",
      "noopener,noreferrer",
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border bg-surface p-3 text-sm text-muted">
        <Loader2 className="animate-spin text-accent" size={16} />
        Carregando escala...
      </div>
    );
  }

  if (!schedule || schedule.assignments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface p-3 text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  const groups = groupAssignments(schedule.assignments);
  const pendingCount = schedule.assignments.filter(
    (assignment) => assignment.confirmationStatus === "PENDING",
  ).length;

  return (
    <div className="grid gap-2">
      {showConfirmationActions && pendingCount > 0 ? (
        <div className="flex items-start gap-2 rounded-lg border border-info/30 bg-info/10 p-3 text-sm text-muted">
          <BellRing className="mt-0.5 shrink-0 text-info" size={16} />
          <span>
            {pendingCount === 1
              ? "1 pendente receberá"
              : `${pendingCount} pendentes receberão`}{" "}
            lembrete automático às 08:00 um dia antes do evento.
          </span>
        </div>
      ) : null}

      {groups.map((ministry) => (
        <div
          key={ministry.ministryId}
          className="rounded-lg border border-border bg-surface p-3"
        >
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserCheck size={15} className="text-accent" />
            {ministry.ministryName}
          </div>

          <div className="grid gap-2">
            {ministry.roles.map((role) => (
              <div key={role.roleId} className="grid gap-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                  {role.roleName}
                </p>
                <div className="grid gap-1.5">
                  {role.assignments.map((assignment) => {
                    const status = statusDetails[assignment.confirmationStatus];
                    const StatusIcon = status.icon;
                    const isCopied =
                      copied?.assignmentId === assignment.id &&
                      copied.target === "link";

                    return (
                      <div
                        key={assignment.id}
                        className="grid gap-2 rounded-lg border border-border bg-surface-subtle px-2 py-2 text-sm text-foreground"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <span className="block truncate font-medium">
                              {assignment.worker.name}
                            </span>
                            {compact ? null : (
                              <span className="text-xs text-muted">
                                {formatBrazilianPhone(assignment.worker.whatsapp)}
                              </span>
                            )}
                          </div>

                          <span
                            className={`inline-flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${status.className}`}
                          >
                            <StatusIcon size={13} />
                            {status.label}
                          </span>
                        </div>

                        {showConfirmationActions || onDeleteAssignment ? (
                          <div
                            className={`grid gap-2 ${
                              onDeleteAssignment
                                ? "sm:grid-cols-3"
                                : "sm:grid-cols-2"
                            }`}
                          >
                            {showConfirmationActions ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void handleCopyLink(assignment)}
                                  className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-xs font-semibold text-foreground transition-all duration-200 hover:border-accent hover:text-accent"
                                >
                                  {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                  {isCopied ? "Link copiado" : "Copiar link"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenWhatsapp(assignment)}
                                  className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-accent bg-accent px-3 text-xs font-semibold text-accent-foreground transition-all duration-200 hover:bg-yellow-400"
                                >
                                  <Send size={14} />
                                  WhatsApp
                                </button>
                              </>
                            ) : null}
                            {onDeleteAssignment ? (
                              <button
                                type="button"
                                onClick={() => onDeleteAssignment(assignment)}
                                disabled={deletingAssignmentId === assignment.id}
                                className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 text-xs font-semibold text-danger transition-all duration-200 hover:border-danger disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {deletingAssignmentId === assignment.id ? (
                                  <Loader2 className="animate-spin" size={14} />
                                ) : (
                                  <Trash2 size={14} />
                                )}
                                Remover
                              </button>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
