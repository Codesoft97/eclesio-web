import { Loader2, UserCheck } from "lucide-react";

import { formatBrazilianPhone } from "@/lib/formatters/phone";

import type { EventSchedule, EventScheduleAssignment } from "../event-types";

interface EventScheduleSummaryProps {
  schedule: EventSchedule | null | undefined;
  isLoading?: boolean;
  compact?: boolean;
  emptyMessage?: string;
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

export function EventScheduleSummary({
  schedule,
  isLoading = false,
  compact = false,
  emptyMessage = "Nenhum obreiro escalado.",
}: EventScheduleSummaryProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 border border-border bg-surface p-3 text-sm text-muted">
        <Loader2 className="animate-spin text-accent" size={16} />
        Carregando escala...
      </div>
    );
  }

  if (!schedule || schedule.assignments.length === 0) {
    return (
      <div className="border border-dashed border-border bg-surface p-3 text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  const groups = groupAssignments(schedule.assignments);

  return (
    <div className="grid gap-2">
      {groups.map((ministry) => (
        <div
          key={ministry.ministryId}
          className="border border-border bg-surface p-3"
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
                <div className="grid gap-1">
                  {role.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex flex-col gap-0.5 border border-border bg-surface-subtle px-2 py-1.5 text-sm text-foreground sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-medium">{assignment.worker.name}</span>
                      {compact ? null : (
                        <span className="text-xs text-muted">
                          {formatBrazilianPhone(assignment.worker.whatsapp)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}