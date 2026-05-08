import { api } from "@/lib/api";

import type {
  ChurchEvent,
  EventPayload,
  EventShareResponse,
  PublicChurchEvent,
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

export async function getPublicEvent(shareToken: string) {
  const { data } = await api.get<PublicChurchEvent>(
    `/public/events/${shareToken}`,
  );
  return data;
}

export async function deleteEvent(eventId: string) {
  await api.delete(`/events/${eventId}`);
}
