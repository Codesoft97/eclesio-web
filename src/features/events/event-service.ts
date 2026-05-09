import { api } from "@/lib/api";

import type {
  ChurchEvent,
  EventPayload,
  EventSchedule,
  EventSchedulePayload,
  EventShareResponse,
  PublicChurchEvent,
  PublicEventScheduleAssignment,
} from "./event-types";

export async function listEvents() {
  const { data } = await api.get<ChurchEvent[]>("/events");
  return data;
}

export async function createEvent(payload: EventPayload) {
  const { data } = await api.post<ChurchEvent>("/events", payload);
  return data;
}

export async function updateEvent(eventId: string, payload: EventPayload) {
  const { data } = await api.patch<ChurchEvent>(`/events/${eventId}`, payload);
  return data;
}

export async function getEventShare(eventId: string) {
  const { data } = await api.get<EventShareResponse>(`/events/${eventId}/share`);
  return data;
}

export async function getEventSchedule(eventId: string) {
  const { data } = await api.get<EventSchedule>(`/events/${eventId}/schedule`, {
    params: { cacheKey: Date.now() },
  });
  return data;
}

export async function addEventScheduleAssignments(
  eventId: string,
  payload: EventSchedulePayload,
) {
  const { data } = await api.post<EventSchedule>(
    `/events/${eventId}/schedule/assignments`,
    payload,
  );
  return data;
}

export async function setEventSchedule(
  eventId: string,
  payload: EventSchedulePayload,
) {
  const { data } = await api.put<EventSchedule>(
    `/events/${eventId}/schedule`,
    payload,
  );
  return data;
}

export async function deleteEventScheduleAssignment(
  eventId: string,
  assignmentId: string,
) {
  await api.delete(`/events/${eventId}/schedule/${assignmentId}`);
}

export async function getPublicEvent(shareToken: string) {
  const { data } = await api.get<PublicChurchEvent>(
    `/public/events/${shareToken}`,
  );
  return data;
}

export async function getPublicEventScheduleAssignment(
  confirmationToken: string,
) {
  const { data } = await api.get<PublicEventScheduleAssignment>(
    `/public/event-schedules/${confirmationToken}`,
  );
  return data;
}

export async function acceptPublicEventScheduleAssignment(
  confirmationToken: string,
) {
  const { data } = await api.post<PublicEventScheduleAssignment>(
    `/public/event-schedules/${confirmationToken}/accept`,
  );
  return data;
}

export async function declinePublicEventScheduleAssignment(
  confirmationToken: string,
) {
  const { data } = await api.post<PublicEventScheduleAssignment>(
    `/public/event-schedules/${confirmationToken}/decline`,
  );
  return data;
}

export async function deleteEvent(eventId: string) {
  await api.delete(`/events/${eventId}`);
}