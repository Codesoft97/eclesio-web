import type { MemberPortalEvent } from "./member-portal-types";

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatFullDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function sortEvents(events: MemberPortalEvent[]) {
  return [...events].sort(
    (firstEvent, secondEvent) =>
      new Date(firstEvent.startsAt).getTime() -
      new Date(secondEvent.startsAt).getTime(),
  );
}
