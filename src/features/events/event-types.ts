export interface ChurchEvent {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  isRecurring: boolean;
  recurrenceGroupId: string | null;
  recurrenceEndsAt: string | null;
  recurrenceWeekday: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventPayload {
  title: string;
  description: string;
  startsAt: string;
  isRecurring?: boolean;
}

export interface EventShareResponse {
  event: ChurchEvent;
  shareUrl: string;
  message: string;
}

export interface EventScheduleAssignment {
  id: string;
  eventId: string;
  ministryId: string;
  ministry: {
    id: string;
    name: string;
  };
  roleId: string;
  role: {
    id: string;
    name: string;
  };
  workerId: string;
  worker: {
    id: string;
    name: string;
    whatsapp: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EventSchedule {
  eventId: string;
  assignments: EventScheduleAssignment[];
}

export interface EventScheduleAssignmentPayload {
  ministryId: string;
  roleId: string;
  workerId: string;
}

export interface EventSchedulePayload {
  assignments: EventScheduleAssignmentPayload[];
}

export interface PublicChurchEvent {
  shareToken: string;
  title: string;
  description: string;
  startsAt: string;
  isRecurring: boolean;
  recurrenceGroupId: string | null;
  recurrenceEndsAt: string | null;
  recurrenceWeekday: number | null;
  church: {
    name: string;
    slug: string;
  };
}
