"use client";

import {
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Repeat2,
  Share2,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import {
  listWorkerMinistries,
  listWorkers,
} from "@/features/workers/worker-service";
import type { Worker, WorkerMinistry } from "@/features/workers/worker-types";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";

import { EventFormModal } from "./event-form-modal";
import { EventScheduleModal } from "./event-schedule-modal";
import { EventScheduleSummary } from "./event-schedule-summary";
import { EventShareModal } from "./event-share-modal";
import {
  addEventScheduleAssignments,
  createEvent,
  deleteEvent,
  deleteEventScheduleAssignment,
  getEventSchedule,
  getEventShare,
  listEvents,
  updateEvent,
} from "../event-service";
import type {
  ChurchEvent,
  EventPayload,
  EventSchedule,
  EventSchedulePayload,
  EventShareResponse,
} from "../event-types";

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

type ModalState =
  | { isOpen: false; mode: "create"; event: null; initialDate: Date }
  | { isOpen: true; mode: "create"; event: null; initialDate: Date }
  | { isOpen: true; mode: "edit"; event: ChurchEvent; initialDate: Date };

type CopiedTarget = "message" | "url" | null;

type ShareState =
  | {
      isOpen: false;
      event: null;
      share: null;
      isLoading: false;
      error: null;
      copied: null;
    }
  | {
      isOpen: true;
      event: ChurchEvent;
      share: EventShareResponse | null;
      isLoading: boolean;
      error: string | null;
      copied: CopiedTarget;
    };

type SchedulePreviewMap = Record<string, EventSchedule>;

type ScheduleState =
  | {
      isOpen: false;
      event: null;
      schedule: null;
      isLoading: false;
      isSubmitting: false;
      error: null;
      successMessage: null;
    }
  | {
      isOpen: true;
      event: ChurchEvent;
      schedule: EventSchedule | null;
      isLoading: boolean;
      isSubmitting: boolean;
      error: string | null;
      successMessage: string | null;
    };

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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

function formatEventDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatRecurrence(event: ChurchEvent) {
  if (!event.isRecurring) {
    return null;
  }

  const weekday =
    event.recurrenceWeekday !== null
      ? recurrenceWeekDays[event.recurrenceWeekday]
      : null;

  return weekday ? `Toda ${weekday}` : "Recorrente";
}

function getEventsForDate(events: ChurchEvent[], date: Date) {
  const dateKey = getDateKey(date);

  return events
    .filter((event) => getDateKey(new Date(event.startsAt)) === dateKey)
    .sort(
      (firstEvent, secondEvent) =>
        new Date(firstEvent.startsAt).getTime() -
        new Date(secondEvent.startsAt).getTime(),
    );
}

function getEventsForMonth(events: ChurchEvent[], month: Date) {
  return events.filter((event) => isSameMonth(new Date(event.startsAt), month));
}

function createClosedModalState(initialDate: Date): ModalState {
  return {
    isOpen: false,
    mode: "create",
    event: null,
    initialDate,
  };
}

const closedShareState: ShareState = {
  isOpen: false,
  event: null,
  share: null,
  isLoading: false,
  error: null,
  copied: null,
};

const closedScheduleState: ScheduleState = {
  isOpen: false,
  event: null,
  schedule: null,
  isLoading: false,
  isSubmitting: false,
  error: null,
  successMessage: null,
};

export function EventsPageClient() {
  const router = useRouter();
  const { clearSession } = useAuth();
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [ministries, setMinistries] = useState<WorkerMinistry[]>([]);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [modalState, setModalState] = useState<ModalState>(() =>
    createClosedModalState(new Date()),
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [shareState, setShareState] = useState<ShareState>(closedShareState);
  const [scheduleState, setScheduleState] =
    useState<ScheduleState>(closedScheduleState);
  const [schedulePreviews, setSchedulePreviews] = useState<SchedulePreviewMap>({});
  const [loadingSchedulePreviewIds, setLoadingSchedulePreviewIds] = useState<string[]>([]);
  const [deletingScheduleAssignmentId, setDeletingScheduleAssignmentId] =
    useState<string | null>(null);
  const loadingSchedulePreviewIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let ignore = false;

    async function loadEvents() {
      setIsLoading(true);
      setError(null);

      try {
        const [eventsData, ministriesData, workersData] = await Promise.all([
          listEvents(),
          listWorkerMinistries(),
          listWorkers(),
        ]);

        if (!ignore) {
          setEvents(eventsData);
          setMinistries(ministriesData);
          setWorkers(workersData);
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
  }, [clearSession, reloadKey, router]);

  const calendarDays = getCalendarDays(visibleMonth);
  const selectedEvents = getEventsForDate(events, selectedDate);
  const selectedEventIdsKey = selectedEvents.map((event) => event.id).join(":");
  const visibleMonthEvents = getEventsForMonth(events, visibleMonth);
  const recurringEventsCount = visibleMonthEvents.filter(
    (event) => event.isRecurring,
  ).length;

  useEffect(() => {
    const selectedEventIds = selectedEventIdsKey
      ? selectedEventIdsKey.split(":")
      : [];
    const missingEventIds = selectedEventIds.filter(
      (eventId) =>
        !schedulePreviews[eventId] &&
        !loadingSchedulePreviewIdsRef.current.has(eventId),
    );

    if (missingEventIds.length === 0) {
      return;
    }

    for (const eventId of missingEventIds) {
      loadingSchedulePreviewIdsRef.current.add(eventId);
    }

    setLoadingSchedulePreviewIds((current) =>
      Array.from(new Set([...current, ...missingEventIds])),
    );

    async function loadSchedulePreviews() {
      try {
        const scheduleEntries = await Promise.allSettled(
          missingEventIds.map(async (eventId) => ({
            eventId,
            schedule: await getEventSchedule(eventId),
          })),
        );
        const successfulSchedules = scheduleEntries
          .filter(
            (
              result,
            ): result is PromiseFulfilledResult<{
              eventId: string;
              schedule: EventSchedule;
            }> => result.status === "fulfilled",
          )
          .map((result) => result.value);

        if (successfulSchedules.length > 0) {
          setSchedulePreviews((current) => ({
            ...current,
            ...Object.fromEntries(
              successfulSchedules.map(({ eventId, schedule }) => [
                eventId,
                schedule,
              ]),
            ),
          }));
        }

        const failedSchedule = scheduleEntries.find(
          (result): result is PromiseRejectedResult =>
            result.status === "rejected",
        );

        if (failedSchedule) {
          if (isUnauthorizedApiError(failedSchedule.reason)) {
            clearSession();
            router.push("/login");
            return;
          }

          setError(getApiErrorMessage(failedSchedule.reason));
        }
      } catch (err) {
        if (isUnauthorizedApiError(err)) {
          clearSession();
          router.push("/login");
          return;
        }

        setError(getApiErrorMessage(err));
      } finally {
        for (const eventId of missingEventIds) {
          loadingSchedulePreviewIdsRef.current.delete(eventId);
        }

        setLoadingSchedulePreviewIds((current) =>
          current.filter((eventId) => !missingEventIds.includes(eventId)),
        );
      }
    }

    void loadSchedulePreviews();
  }, [clearSession, router, schedulePreviews, selectedEventIdsKey]);
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

  function openCreateModal(date = selectedDate) {
    setSubmitError(null);
    setModalState({
      isOpen: true,
      mode: "create",
      event: null,
      initialDate: date,
    });
  }

  function openEditModal(event: ChurchEvent) {
    setSubmitError(null);
    setModalState({
      isOpen: true,
      mode: "edit",
      event,
      initialDate: new Date(event.startsAt),
    });
  }

  async function openShareModal(event: ChurchEvent) {
    setShareState({
      isOpen: true,
      event,
      share: null,
      isLoading: true,
      error: null,
      copied: null,
    });

    try {
      const share = await getEventShare(event.id);

      setShareState((current) =>
        current.isOpen && current.event.id === event.id
          ? { ...current, share, isLoading: false, error: null }
          : current,
      );
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setShareState((current) =>
        current.isOpen && current.event.id === event.id
          ? { ...current, isLoading: false, error: getApiErrorMessage(err) }
          : current,
      );
    }
  }

  async function openScheduleModal(event: ChurchEvent) {
    const cachedSchedule = schedulePreviews[event.id] ?? null;

    setScheduleState({
      isOpen: true,
      event,
      schedule: cachedSchedule,
      isLoading: !cachedSchedule,
      isSubmitting: false,
      error: null,
      successMessage: null,
    });

    if (cachedSchedule) {
      return;
    }

    try {
      const schedule = await getEventSchedule(event.id);

      setScheduleState((current) =>
        current.isOpen && current.event.id === event.id
          ? { ...current, schedule, isLoading: false, error: null, successMessage: null }
          : current,
      );
      setSchedulePreviews((current) => ({ ...current, [event.id]: schedule }));
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setScheduleState((current) =>
        current.isOpen && current.event.id === event.id
          ? { ...current, isLoading: false, error: getApiErrorMessage(err), successMessage: null }
          : current,
      );
    }
  }
  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setModalState(createClosedModalState(selectedDate));
  }

  function closeShareModal() {
    setShareState(closedShareState);
  }

  function closeScheduleModal() {
    setScheduleState(closedScheduleState);
  }

  async function handleUnauthorized(err: unknown) {
    if (!isUnauthorizedApiError(err)) {
      return false;
    }

    clearSession();
    router.push("/login");
    return true;
  }

  async function copyToClipboard(value: string, target: CopiedTarget) {
    try {
      await navigator.clipboard.writeText(value);
      setShareState((current) =>
        current.isOpen ? { ...current, copied: target } : current,
      );
      window.setTimeout(() => {
        setShareState((current) =>
          current.isOpen ? { ...current, copied: null } : current,
        );
      }, 1600);
    } catch {
      setShareState((current) =>
        current.isOpen
          ? { ...current, error: "Não foi possível copiar automaticamente." }
          : current,
      );
    }
  }

  function handleCopyShareMessage() {
    if (shareState.isOpen && shareState.share) {
      void copyToClipboard(shareState.share.message, "message");
    }
  }

  function handleCopyShareUrl() {
    if (shareState.isOpen && shareState.share) {
      void copyToClipboard(shareState.share.shareUrl, "url");
    }
  }

  function handleOpenWhatsapp() {
    if (!shareState.isOpen || !shareState.share) {
      return;
    }

    window.open(
      `https://wa.me/?text=${encodeURIComponent(shareState.share.message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function handleSubmit(payload: EventPayload) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (modalState.mode === "edit" && modalState.event) {
        await updateEvent(modalState.event.id, payload);
      } else {
        await createEvent(payload);
      }

      const payloadDate = new Date(payload.startsAt);
      setSelectedDate(payloadDate);
      setVisibleMonth(startOfMonth(payloadDate));
      setModalState(createClosedModalState(payloadDate));
      refreshEvents();
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setSubmitError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleScheduleSubmit(payload: EventSchedulePayload) {
    if (!scheduleState.isOpen) {
      return;
    }

    const eventId = scheduleState.event.id;
    const successMessage =
      payload.assignments.length > 1
        ? "Obreiros adicionados à escala."
        : "Obreiro adicionado à escala.";

    setScheduleState((current) =>
      current.isOpen ? { ...current, isSubmitting: true, error: null, successMessage: null } : current,
    );

    try {
      const schedule = await addEventScheduleAssignments(eventId, payload);

      setScheduleState((current) =>
        current.isOpen && current.event.id === eventId
          ? { ...current, schedule, isSubmitting: false, error: null, successMessage }
          : current,
      );
      setSchedulePreviews((current) => ({ ...current, [eventId]: schedule }));
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setScheduleState((current) =>
        current.isOpen && current.event.id === eventId
          ? {
              ...current,
              isSubmitting: false,
              error: getApiErrorMessage(err),
              successMessage: null,
            }
          : current,
      );
    }
  }

  async function handleDeleteScheduleAssignment(
    eventId: string,
    assignmentId: string,
  ) {
    const confirmed = window.confirm(
      "Deseja remover este obreiro da escala? O link de confirmação dele deixará de funcionar.",
    );

    if (!confirmed) {
      return;
    }

    setDeletingScheduleAssignmentId(assignmentId);
    setError(null);
    setScheduleState((current) =>
      current.isOpen && current.event.id === eventId
        ? { ...current, error: null, successMessage: null }
        : current,
    );

    try {
      await deleteEventScheduleAssignment(eventId, assignmentId);

      setScheduleState((current) =>
        current.isOpen && current.event.id === eventId
          ? {
              ...current,
              successMessage: "Obreiro removido da escala.",
              schedule: current.schedule
                ? {
                    ...current.schedule,
                    assignments: current.schedule.assignments.filter(
                      (assignment) => assignment.id !== assignmentId,
                    ),
                  }
                : current.schedule,
            }
          : current,
      );
      setSchedulePreviews((current) => {
        const schedule = current[eventId];

        if (!schedule) {
          return current;
        }

        return {
          ...current,
          [eventId]: {
            ...schedule,
            assignments: schedule.assignments.filter(
              (assignment) => assignment.id !== assignmentId,
            ),
          },
        };
      });
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      const message = getApiErrorMessage(err);

      setScheduleState((current) =>
        current.isOpen && current.event.id === eventId
          ? { ...current, error: message, successMessage: null }
          : current,
      );
      setError(message);
    } finally {
      setDeletingScheduleAssignmentId(null);
    }
  }

  function clearScheduleFeedback() {
    setScheduleState((current) =>
      current.isOpen ? { ...current, error: null, successMessage: null } : current,
    );
  }

  async function handleDelete(event: ChurchEvent) {
    const recurrenceSuffix = event.isRecurring
      ? " Apenas esta ocorrência será excluída."
      : "";
    const confirmed = window.confirm(
      `Deseja excluir o evento ${event.title}? Esta ação não poderá ser desfeita.${recurrenceSuffix}`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(event.id);
    setError(null);

    try {
      await deleteEvent(event.id);
      setEvents((current) => current.filter((item) => item.id !== event.id));
      setSchedulePreviews((current) => {
        const nextSchedules = { ...current };
        delete nextSchedules[event.id];
        return nextSchedules;
      });
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:mb-8 sm:pb-6 xl:flex-row xl:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Agenda
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Eventos e cultos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Visualize o calendário da igreja, crie cultos recorrentes e monte a escala de obreiros para cada evento.
          </p>
        </div>

        <div className="grid gap-3 sm:flex sm:items-center">
          <div className="flex items-center justify-between border border-border bg-surface px-4 py-3 text-sm shadow-sm sm:block">
            <span className="text-muted">Eventos no mês</span>
            <strong className="ml-3 text-foreground">
              {visibleMonthEvents.length}
            </strong>
          </div>
          <div className="flex items-center justify-between border border-border bg-surface px-4 py-3 text-sm shadow-sm sm:block">
            <span className="text-muted">Recorrentes</span>
            <strong className="ml-3 text-foreground">
              {recurringEventsCount}
            </strong>
          </div>
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => openCreateModal()}
          >
            <Plus size={17} />
            Novo evento
          </Button>
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
        <section className="border border-border bg-surface shadow-sm">
          <div className="grid gap-4 border-b border-border p-3 sm:p-4 lg:flex lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-surface-subtle text-foreground">
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
                Próximo
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
                    const dayEvents = getEventsForDate(events, day);
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
                                    event.isRecurring ? "bg-primary" : "bg-accent"
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
                      const dayEvents = getEventsForDate(events, day);
                      const isCurrentMonth = isSameMonth(day, visibleMonth);
                      const isSelected = isSameDay(day, selectedDate);
                      const isToday = isSameDay(day, new Date());
                      const hiddenEventsCount = Math.max(dayEvents.length - 3, 0);

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
                                  event.isRecurring
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

        <aside className="border border-border bg-surface shadow-sm xl:sticky xl:top-5 xl:self-start">
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
            <Button
              type="button"
              className="mt-4 w-full"
              onClick={() => openCreateModal(selectedDate)}
            >
              <Plus size={17} />
              Novo neste dia
            </Button>
          </div>

          <div className="grid gap-3 p-3 sm:p-4">
            {selectedEvents.length === 0 ? (
              <div className="border border-dashed border-border bg-surface-subtle p-5 text-center">
                <CalendarClock className="mx-auto mb-3 text-muted" size={24} />
                <h3 className="text-sm font-semibold text-foreground">
                  Nenhum evento neste dia
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Use o botão acima para adicionar o primeiro evento desta data.
                </p>
              </div>
            ) : (
              selectedEvents.map((event) => {
                const recurrenceLabel = formatRecurrence(event);

                return (
                  <article
                    key={event.id}
                    className="border border-border bg-surface-subtle p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                          {formatEventDateTime(event.startsAt)}
                        </p>
                        <h3 className="mt-2 text-base font-semibold text-foreground">
                          {event.title}
                        </h3>
                        {recurrenceLabel ? (
                          <span className="mt-2 inline-flex items-center gap-1 border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-semibold text-foreground">
                            <Repeat2 size={13} />
                            {recurrenceLabel}
                          </span>
                        ) : null}
                      </div>
                      <span className="h-2 w-2 shrink-0 bg-accent" />
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-muted">
                      {event.description}
                    </p>

                    <div className="mt-4 border-t border-border pt-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">
                          Escala de obreiros
                        </p>
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                          {schedulePreviews[event.id]?.assignments.length ?? 0} pessoa(s)
                        </span>
                      </div>
                      <EventScheduleSummary
                        schedule={schedulePreviews[event.id]}
                        isLoading={loadingSchedulePreviewIds.includes(event.id)}
                        eventTitle={event.title}
                        eventStartsAt={event.startsAt}
                        emptyMessage="Nenhum obreiro escalado para este evento."
                        deletingAssignmentId={deletingScheduleAssignmentId}
                        onDeleteAssignment={(assignment) =>
                          void handleDeleteScheduleAssignment(event.id, assignment.id)
                        }
                      />
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => void openScheduleModal(event)}
                      >
                        <UserCheck size={16} />
                        Escala
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => void openShareModal(event)}
                      >
                        <Share2 size={16} />
                        Compartilhar
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => openEditModal(event)}
                      >
                        <Edit3 size={16} />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => void handleDelete(event)}
                        disabled={deletingId === event.id}
                      >
                        {deletingId === event.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Trash2 size={16} />
                        )}
                        Excluir
                      </Button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </aside>
      </div>

      {shareState.isOpen ? (
        <EventShareModal
          event={shareState.event}
          share={shareState.share}
          isLoading={shareState.isLoading}
          error={shareState.error}
          copied={shareState.copied}
          onClose={closeShareModal}
          onCopyMessage={handleCopyShareMessage}
          onCopyUrl={handleCopyShareUrl}
          onOpenWhatsapp={handleOpenWhatsapp}
        />
      ) : null}

      {scheduleState.isOpen ? (
        <EventScheduleModal
          key={`${scheduleState.event.id}-${
            scheduleState.schedule?.assignments
              .map((assignment) => assignment.id)
              .join(":") ?? "loading"
          }`}
          event={scheduleState.event}
          schedule={scheduleState.schedule}
          ministries={ministries}
          workers={workers}
          isLoading={scheduleState.isLoading}
          isSubmitting={scheduleState.isSubmitting}
          error={scheduleState.error}
          successMessage={scheduleState.successMessage}
          onClose={closeScheduleModal}
          onSubmit={(payload) => void handleScheduleSubmit(payload)}
          onClearFeedback={clearScheduleFeedback}
        />
      ) : null}

      {modalState.isOpen ? (
        <EventFormModal
          key={
            modalState.mode === "edit"
              ? modalState.event.id
              : getDateKey(modalState.initialDate)
          }
          mode={modalState.mode}
          event={modalState.event}
          initialDate={modalState.initialDate}
          isSubmitting={isSubmitting}
          error={submitError}
          onClose={closeModal}
          onSubmit={(payload) => void handleSubmit(payload)}
        />
      ) : null}
    </div>
  );
}
