"use client";

import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  Repeat2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";
import { fetchAllPaginatedItems } from "@/lib/pagination";

import { formatEventDate, sortEvents } from "../member-portal-formatters";
import { listMemberPortalEvents } from "../member-portal-service";
import type {
  MemberPortalEvent,
  MemberPortalScheduleStatus,
} from "../member-portal-types";
import { MemberPortalImagePreview } from "./member-portal-image-preview";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const recurrenceWeekDays = [
  "domingo",
  "segunda-feira",
  "terca-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sabado",
];

const scheduleStatusDetails: Record<
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

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function isSameMonth(date: Date, month: Date) {
  return (
    date.getFullYear() === month.getFullYear() &&
    date.getMonth() === month.getMonth()
  );
}

function isSameDay(firstDate: Date, secondDate: Date) {
  return getDateKey(firstDate) === getDateKey(secondDate);
}

function getCalendarDays(month: Date) {
  const firstDay = startOfMonth(month);
  const firstWeekday = firstDay.getDay();
  const calendarStart = new Date(
    firstDay.getFullYear(),
    firstDay.getMonth(),
    1 - firstWeekday,
  );

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return date;
  });
}

function getCalendarRange(month: Date) {
  const calendarDays = getCalendarDays(month);
  const firstDay = calendarDays[0];
  const lastDay = calendarDays[calendarDays.length - 1];

  return {
    from: startOfDay(firstDay).toISOString(),
    to: endOfDay(lastDay).toISOString(),
  };
}

function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatSelectedDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
}

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatRecurrence(event: MemberPortalEvent) {
  if (!event.isRecurring) {
    return null;
  }

  const weekday =
    event.recurrenceWeekday !== null
      ? recurrenceWeekDays[event.recurrenceWeekday]
      : null;

  return weekday ? `Todo(a) ${weekday}` : "Recorrente";
}

function getEventsForDate(events: MemberPortalEvent[], date: Date) {
  const dateKey = getDateKey(date);

  return sortEvents(
    events.filter((event) => getDateKey(new Date(event.startsAt)) === dateKey),
  );
}

function getEventsForMonth(events: MemberPortalEvent[], month: Date) {
  return events.filter((event) => isSameMonth(new Date(event.startsAt), month));
}

function EventScheduleBlock({ event }: { event: MemberPortalEvent }) {
  const myScheduleAssignments = event.myScheduleAssignments ?? [];

  if (myScheduleAssignments.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 rounded-lg border border-accent/30 bg-accent/10 p-3">
      <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
        <ClipboardCheck size={15} />
        Minha escala
      </p>
      <div className="mt-3 grid gap-2">
        {myScheduleAssignments.map((assignment) => {
          const status = scheduleStatusDetails[assignment.confirmationStatus];
          const StatusIcon = status.icon;

          return (
            <div
              key={assignment.id}
              className="flex flex-col gap-3 rounded-md border border-border bg-surface px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {assignment.ministry.name}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {assignment.role.name}
                </p>
              </div>
              <span
                className={`inline-flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${status.className}`}
              >
                <StatusIcon size={13} />
                {status.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MemberPortalEventsPageClient() {
  const router = useRouter();
  const { clearSession } = useAuth();
  const [events, setEvents] = useState<MemberPortalEvent[]>([]);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadEvents() {
      setIsLoading(true);
      setError(null);

      try {
        const range = getCalendarRange(visibleMonth);
        const eventsData = await fetchAllPaginatedItems((params) =>
          listMemberPortalEvents({
            ...range,
            ...params,
          }),
        );

        if (!ignore) {
          setEvents(eventsData);
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

    void loadEvents();

    return () => {
      ignore = true;
    };
  }, [clearSession, reloadKey, router, visibleMonth]);

  const sortedEvents = useMemo(() => sortEvents(events), [events]);
  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth],
  );
  const selectedEvents = useMemo(
    () => getEventsForDate(sortedEvents, selectedDate),
    [selectedDate, sortedEvents],
  );
  const visibleMonthEvents = useMemo(
    () => getEventsForMonth(sortedEvents, visibleMonth),
    [sortedEvents, visibleMonth],
  );
  const recurringEventsCount = visibleMonthEvents.filter(
    (event) => event.isRecurring,
  ).length;
  const mySchedulesInMonthCount = visibleMonthEvents.reduce(
    (total, event) => total + (event.myScheduleAssignments?.length ?? 0),
    0,
  );

  function refreshEvents() {
    setReloadKey((current) => current + 1);
  }

  function goToPreviousMonth() {
    setVisibleMonth((current) => addMonths(current, -1));
  }

  function goToNextMonth() {
    setVisibleMonth((current) => addMonths(current, 1));
  }

  function goToToday() {
    const today = new Date();
    setSelectedDate(today);
    setVisibleMonth(startOfMonth(today));
  }

  function selectDate(date: Date) {
    setSelectedDate(date);

    if (!isSameMonth(date, visibleMonth)) {
      setVisibleMonth(startOfMonth(date));
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:mb-8 sm:pb-6 xl:flex-row xl:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Portal da igreja
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Eventos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Navegue pelo calendario da igreja e veja sua escala nos eventos em
            que voce foi escalado.
          </p>
        </div>

        <div className="grid gap-3 sm:flex sm:items-center">
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm shadow-sm sm:block">
            <span className="text-muted">Eventos no mes</span>
            <strong className="ml-3 text-foreground">
              {visibleMonthEvents.length}
            </strong>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm shadow-sm sm:block">
            <span className="text-muted">Minhas escalas</span>
            <strong className="ml-3 text-foreground">
              {mySchedulesInMonthCount}
            </strong>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3 text-sm shadow-sm sm:block">
            <span className="text-muted">Recorrentes</span>
            <strong className="ml-3 text-foreground">
              {recurringEventsCount}
            </strong>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-4 grid gap-3 border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:flex sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={refreshEvents}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_24rem]">
        <section className="rounded-xl border border-border bg-surface shadow-sm">
          <div className="grid gap-4 border-b border-border p-3 sm:p-4 lg:flex lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
                <CalendarDays size={18} />
              </span>
              <div>
                <h2 className="text-base font-semibold capitalize text-foreground sm:text-lg">
                  {formatMonthTitle(visibleMonth)}
                </h2>
                <p className="text-xs text-muted">
                  Toque em um dia para ver detalhes
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              <Button
                type="button"
                variant="ghost"
                className="h-10 px-3"
                onClick={goToPreviousMonth}
              >
                <ChevronLeft size={16} />
                Anterior
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 px-3"
                onClick={goToToday}
              >
                Hoje
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 px-3"
                onClick={goToNextMonth}
              >
                Proximo
                <ChevronRight size={16} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-10 px-3"
                onClick={refreshEvents}
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
            <div className="grid min-h-80 place-items-center p-8 text-center text-sm text-muted md:min-h-[34rem]">
              <div>
                <Loader2
                  className="mx-auto mb-3 animate-spin text-accent"
                  size={24}
                />
                Carregando eventos...
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 md:hidden">
                <div className="grid grid-cols-7 border border-border bg-surface-subtle text-center text-[10px] uppercase tracking-[0.08em] text-muted">
                  {weekDays.map((day) => (
                    <div key={day} className="py-2 font-semibold">
                      {day.slice(0, 1)}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 border-l border-border">
                  {calendarDays.map((day) => {
                    const dayEvents = getEventsForDate(sortedEvents, day);
                    const isCurrentMonth = isSameMonth(day, visibleMonth);
                    const isSelected = isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    const visibleDots = dayEvents.slice(0, 3);
                    const hiddenEventsCount = Math.max(
                      dayEvents.length - visibleDots.length,
                      0,
                    );

                    return (
                      <button
                        key={getDateKey(day)}
                        type="button"
                        onClick={() => selectDate(day)}
                        aria-label={`${day.getDate()} - ${dayEvents.length} evento(s)`}
                        className={`min-h-16 cursor-pointer border-b border-r border-border p-1.5 text-center transition hover:bg-surface-subtle ${
                          isSelected
                            ? "bg-accent/10 ring-2 ring-inset ring-accent"
                            : "bg-surface"
                        } ${
                          isCurrentMonth
                            ? "text-foreground"
                            : "text-muted opacity-50"
                        }`}
                      >
                        <span
                          className={`mx-auto flex h-7 w-7 items-center justify-center text-xs font-semibold ${
                            isToday
                              ? "bg-primary text-primary-foreground"
                              : "bg-surface-subtle text-foreground"
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        {dayEvents.length > 0 ? (
                          <div className="mt-1 grid justify-items-center gap-1">
                            <div className="flex justify-center gap-0.5">
                              {visibleDots.map((event) => (
                                <span
                                  key={event.id}
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    event.myScheduleAssignments?.length
                                      ? "bg-primary"
                                      : "bg-accent"
                                  }`}
                                />
                              ))}
                            </div>
                            {hiddenEventsCount > 0 ? (
                              <span className="text-[9px] font-semibold text-muted">
                                +{hiddenEventsCount}
                              </span>
                            ) : null}
                          </div>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="hidden overflow-x-auto md:block">
                <div className="min-w-[820px] p-4">
                  <div className="grid grid-cols-7 border-b border-border bg-surface-subtle text-xs uppercase tracking-[0.14em] text-muted">
                    {weekDays.map((day) => (
                      <div key={day} className="px-3 py-3 font-semibold">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 border-l border-border">
                    {calendarDays.map((day) => {
                      const dayEvents = getEventsForDate(sortedEvents, day);
                      const isCurrentMonth = isSameMonth(day, visibleMonth);
                      const isSelected = isSameDay(day, selectedDate);
                      const isToday = isSameDay(day, new Date());
                      const hiddenEventsCount = Math.max(
                        dayEvents.length - 3,
                        0,
                      );

                      return (
                        <button
                          key={getDateKey(day)}
                          type="button"
                          onClick={() => selectDate(day)}
                          className={`min-h-32 cursor-pointer border-b border-r border-border p-2 text-left transition hover:bg-surface-subtle ${
                            isSelected
                              ? "bg-accent/10 ring-2 ring-inset ring-accent"
                              : "bg-surface"
                          } ${
                            isCurrentMonth
                              ? "text-foreground"
                              : "text-muted opacity-60"
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span
                              className={`flex h-7 w-7 items-center justify-center text-sm font-semibold ${
                                isToday
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-surface-subtle text-foreground"
                              }`}
                            >
                              {day.getDate()}
                            </span>
                            {dayEvents.length > 0 ? (
                              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                                {dayEvents.length}
                              </span>
                            ) : null}
                          </div>

                          <div className="grid gap-1">
                            {dayEvents.slice(0, 3).map((event) => (
                              <span
                                key={event.id}
                                className={`truncate border-l-2 bg-surface-subtle px-2 py-1 text-[11px] font-medium text-foreground ${
                                  event.myScheduleAssignments?.length
                                    ? "border-primary"
                                    : "border-accent"
                                }`}
                              >
                                {formatEventTime(event.startsAt)} {event.title}
                              </span>
                            ))}
                            {hiddenEventsCount > 0 ? (
                              <span className="text-[11px] font-medium text-muted">
                                +{hiddenEventsCount} evento(s)
                              </span>
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <aside className="rounded-xl border border-border bg-surface shadow-sm xl:sticky xl:top-5 xl:self-start">
          <div className="border-b border-border p-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Dia selecionado
            </p>
            <h2 className="mt-2 text-lg font-semibold capitalize text-foreground sm:text-xl">
              {formatSelectedDate(selectedDate)}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {selectedEvents.length === 1
                ? "1 evento agendado"
                : `${selectedEvents.length} eventos agendados`}
            </p>
          </div>

          <div className="grid gap-3 p-3 sm:p-4">
            {selectedEvents.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-surface-subtle p-5 text-center">
                <CalendarClock className="mx-auto mb-3 text-muted" size={24} />
                <h3 className="text-sm font-semibold text-foreground">
                  Nenhum evento neste dia
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Selecione outra data no calendario para consultar a agenda.
                </p>
              </div>
            ) : (
              selectedEvents.map((event) => {
                const recurrenceLabel = formatRecurrence(event);

                return (
                  <article
                    key={event.id}
                    className="rounded-lg border border-border bg-surface-subtle p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                          {formatEventDate(event.startsAt)}
                        </p>
                        <h3 className="mt-2 text-base font-semibold text-foreground">
                          {event.title}
                        </h3>
                        {recurrenceLabel ? (
                          <span className="mt-2 inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-semibold text-foreground">
                            <Repeat2 size={13} />
                            {recurrenceLabel}
                          </span>
                        ) : null}
                      </div>
                      <span
                        className={`h-2 w-2 shrink-0 ${
                          event.myScheduleAssignments?.length
                            ? "bg-primary"
                            : "bg-accent"
                        }`}
                      />
                    </div>

                    {event.description ? (
                      <p className="whitespace-pre-wrap text-sm leading-6 text-muted">
                        {event.description}
                      </p>
                    ) : null}

                    {event.imageUrl ? (
                      <MemberPortalImagePreview
                        src={event.imageUrl}
                        label={`imagem do evento ${event.title}`}
                        className="mt-3"
                      />
                    ) : null}

                    <EventScheduleBlock event={event} />
                  </article>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
