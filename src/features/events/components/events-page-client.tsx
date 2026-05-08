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
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";

import { EventFormModal } from "./event-form-modal";
import {
  createEvent,
  deleteEvent,
  listEvents,
  updateEvent,
} from "../event-service";
import type { ChurchEvent, EventPayload } from "../event-types";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

type ModalState =
  | { isOpen: false; mode: "create"; event: null; initialDate: Date }
  | { isOpen: true; mode: "create"; event: null; initialDate: Date }
  | { isOpen: true; mode: "edit"; event: ChurchEvent; initialDate: Date };

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
  return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
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

export function EventsPageClient() {
  const router = useRouter();
  const { clearSession } = useAuth();
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
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

  useEffect(() => {
    let ignore = false;

    async function loadEvents() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await listEvents();

        if (!ignore) {
          setEvents(data);
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
  const visibleMonthEvents = getEventsForMonth(events, visibleMonth);

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
    setModalState({ isOpen: true, mode: "create", event: null, initialDate: date });
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

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setSubmitError(null);
    setModalState(createClosedModalState(selectedDate));
  }

  async function handleUnauthorized(err: unknown) {
    if (!isUnauthorizedApiError(err)) {
      return false;
    }

    clearSession();
    router.push("/login");
    return true;
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

  async function handleDelete(event: ChurchEvent) {
    const confirmed = window.confirm(
      `Deseja excluir o evento ${event.title}? Esta acao nao podera ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(event.id);
    setError(null);

    try {
      await deleteEvent(event.id);
      setEvents((current) => current.filter((item) => item.id !== event.id));
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
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 xl:flex-row xl:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Agenda
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Eventos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Visualize o calendario da igreja, navegue pelos meses e gerencie os eventos de cada dia.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="border border-border bg-surface px-4 py-3 text-sm shadow-sm">
            <span className="text-muted">Eventos no mes</span>
            <strong className="ml-3 text-foreground">{visibleMonthEvents.length}</strong>
          </div>
          <Button type="button" onClick={() => openCreateModal()}>
            <Plus size={17} />
            Novo evento
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 flex flex-col gap-3 border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={refreshEvents}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[1fr_24rem]">
        <section className="border border-border bg-surface shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center bg-surface-subtle text-foreground">
                <CalendarDays size={18} />
              </span>
              <div>
                <h2 className="text-lg font-semibold capitalize text-foreground">
                  {formatMonthTitle(visibleMonth)}
                </h2>
                <p className="text-xs text-muted">Clique em um dia para ver detalhes</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" onClick={goToPreviousMonth}>
                <ChevronLeft size={16} />
                Anterior
              </Button>
              <Button type="button" variant="ghost" onClick={goToToday}>
                Hoje
              </Button>
              <Button type="button" variant="ghost" onClick={goToNextMonth}>
                Proximo
                <ChevronRight size={16} />
              </Button>
              <Button
                type="button"
                variant="ghost"
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
            <div className="grid min-h-[34rem] place-items-center p-8 text-center text-sm text-muted">
              <div>
                <Loader2 className="mx-auto mb-3 animate-spin text-accent" size={24} />
                Carregando eventos...
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                          isSelected ? "bg-accent/10 ring-2 ring-inset ring-accent" : "bg-surface"
                        } ${isCurrentMonth ? "text-foreground" : "text-muted opacity-60"}`}
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
                              className="truncate border-l-2 border-accent bg-surface-subtle px-2 py-1 text-[11px] font-medium text-foreground"
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
          )}
        </section>

        <aside className="border border-border bg-surface shadow-sm">
          <div className="border-b border-border p-4">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              Dia selecionado
            </p>
            <h2 className="mt-2 text-xl font-semibold capitalize text-foreground">
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

          <div className="grid gap-3 p-4">
            {selectedEvents.length === 0 ? (
              <div className="border border-dashed border-border bg-surface-subtle p-5 text-center">
                <CalendarClock className="mx-auto mb-3 text-muted" size={24} />
                <h3 className="text-sm font-semibold text-foreground">Nenhum evento neste dia</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Use o botao acima para adicionar o primeiro evento desta data.
                </p>
              </div>
            ) : (
              selectedEvents.map((event) => (
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
                    </div>
                    <span className="h-2 w-2 shrink-0 bg-accent" />
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-muted">
                    {event.description}
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    <Button type="button" variant="ghost" onClick={() => openEditModal(event)}>
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
              ))
            )}
          </div>
        </aside>
      </div>

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
