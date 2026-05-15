"use client";

import {
  CalendarDays,
  Loader2,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";
import { MAX_PAGE_SIZE } from "@/lib/pagination";

import {
  addDays,
  formatEventDate,
  sortEvents,
} from "../member-portal-formatters";
import {
  getMemberPortalProfile,
  listMemberPortalAnnouncements,
  listMemberPortalEvents,
} from "../member-portal-service";
import type {
  MemberPortalAnnouncement,
  MemberPortalEvent,
  MemberPortalProfile,
} from "../member-portal-types";
import { MemberPortalAnnouncementCard } from "./member-portal-announcement-card";

const calendarWeekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
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

function formatMonthTitle(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(value);
}

function getUpcomingEvents(events: MemberPortalEvent[]) {
  const now = new Date();

  return events
    .filter((event) => new Date(event.startsAt).getTime() >= now.getTime())
    .sort(
      (firstEvent, secondEvent) =>
        new Date(firstEvent.startsAt).getTime() -
        new Date(secondEvent.startsAt).getTime(),
    );
}

function getPortalRange() {
  const now = new Date();
  return {
    from: startOfMonth(now).toISOString(),
    to: addDays(now, 90).toISOString(),
  };
}

export function MemberPortalPageClient() {
  const router = useRouter();
  const { session, clearSession } = useAuth();
  const [profile, setProfile] = useState<MemberPortalProfile | null>(null);
  const [events, setEvents] = useState<MemberPortalEvent[]>([]);
  const [announcements, setAnnouncements] = useState<
    MemberPortalAnnouncement[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [calendarMonth] = useState(() => startOfMonth(new Date()));
  const [today] = useState(() => new Date());

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const [profileData, eventsData, announcementsData] = await Promise.all([
          getMemberPortalProfile(),
          listMemberPortalEvents({ ...getPortalRange(), limit: MAX_PAGE_SIZE }),
          listMemberPortalAnnouncements({ limit: 1 }),
        ]);

        if (!ignore) {
          setProfile(profileData);
          setEvents(eventsData.items);
          setAnnouncements(announcementsData.items);
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

    void loadDashboard();

    return () => {
      ignore = true;
    };
  }, [clearSession, reloadKey, router]);

  const sortedEvents = useMemo(() => sortEvents(events), [events]);
  const upcomingEvents = useMemo(() => getUpcomingEvents(events), [events]);
  const nextEvent = upcomingEvents[0];
  const latestAnnouncement = announcements[0];
  const calendarDays = useMemo(
    () => getCalendarDays(calendarMonth),
    [calendarMonth],
  );
  const eventCountsByDate = useMemo(() => {
    const counts = new Map<string, number>();

    for (const event of sortedEvents) {
      const eventDate = new Date(event.startsAt);

      if (!isSameMonth(eventDate, calendarMonth)) {
        continue;
      }

      const dateKey = getDateKey(eventDate);
      counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
    }

    return counts;
  }, [calendarMonth, sortedEvents]);
  const calendarMonthEventsCount = Array.from(eventCountsByDate.values()).reduce(
    (total, count) => total + count,
    0,
  );

  function refreshDashboard() {
    setReloadKey((current) => current + 1);
  }

  const handleAnnouncementChange = useCallback(
    (updatedAnnouncement: MemberPortalAnnouncement) => {
      setAnnouncements((current) =>
        current.map((announcement) =>
          announcement.id === updatedAnnouncement.id
            ? updatedAnnouncement
            : announcement,
        ),
      );
    },
    [],
  );

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Portal da igreja
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Ola, {profile?.member.name ?? session?.user.name ?? "membro"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Veja rapidamente o que esta chegando na agenda da igreja e o ultimo
            comunicado publicado.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={refreshDashboard}
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

      {error ? (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={refreshDashboard}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid min-h-80 place-items-center rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted shadow-sm">
          <div>
            <Loader2
              className="mx-auto mb-3 animate-spin text-accent"
              size={28}
            />
            Carregando portal...
          </div>
        </div>
      ) : (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="grid gap-4">
            <div className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="mb-5 flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-center">
                <div>
                  <p className="font-mono text-xs uppercase text-muted">
                    Ultimas atualizacoes
                  </p>
                  <h2 className="mt-2 text-lg font-semibold text-foreground">
                    Agenda e comunicados
                  </h2>
                </div>
                <Link
                  href="/portal/eventos"
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent hover:text-accent"
                >
                  Ver agenda
                </Link>
              </div>

              <div className="grid gap-4">
                {nextEvent ? (
                  <article className="rounded-lg border border-border bg-surface-subtle p-4">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-foreground">
                        <CalendarDays size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs uppercase text-muted">
                          Proximo evento
                        </p>
                        <p className="mt-1 font-mono text-xs uppercase text-muted">
                          {formatEventDate(nextEvent.startsAt)}
                        </p>
                        <h3 className="mt-2 text-xl font-semibold text-foreground">
                          {nextEvent.title}
                        </h3>
                        {nextEvent.description ? (
                          <p className="mt-2 text-sm leading-6 text-muted">
                            {nextEvent.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ) : (
                  <article className="rounded-lg border border-dashed border-border bg-surface-subtle p-5 text-sm text-muted">
                    Nenhum evento previsto para os proximos dias.
                  </article>
                )}

                {latestAnnouncement ? (
                  <MemberPortalAnnouncementCard
                    announcement={latestAnnouncement}
                    eyebrow="Ultimo comunicado"
                    actionHref="/portal/comunicados"
                    actionLabel="Ver comunicados"
                    onChange={handleAnnouncementChange}
                  />
                ) : (
                  <article className="rounded-lg border border-dashed border-border bg-surface-subtle p-5 text-sm text-muted">
                    Nenhum comunicado publicado ainda.
                  </article>
                )}
              </div>
            </div>
          </div>

          <article className="rounded-xl border border-border bg-primary p-5 text-primary-foreground shadow-sm dark:bg-surface dark:text-foreground">
            <p className="font-mono text-xs uppercase opacity-70">
              Calendario da igreja
            </p>
            <h2 className="mt-3 text-xl font-semibold">Eventos do mes</h2>
            <div className="mt-5 h-1 w-20 rounded-full bg-accent" />

            <div className="mt-7 rounded-lg border border-white/10 bg-white/[0.04] p-4 dark:border-border dark:bg-surface-subtle">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase opacity-60">
                    Calendario do mes
                  </p>
                  <h3 className="mt-1 text-base font-semibold capitalize">
                    {formatMonthTitle(calendarMonth)}
                  </h3>
                </div>
                <span className="rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                  {calendarMonthEventsCount} evento(s)
                </span>
              </div>

              <div className="mt-5 grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase opacity-55">
                {calendarWeekDays.map((weekDay) => (
                  <span key={weekDay}>{weekDay}</span>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-7 gap-1.5">
                {calendarDays.map((day) => {
                  const dateKey = getDateKey(day);
                  const eventsCount = eventCountsByDate.get(dateKey) ?? 0;
                  const hasEvents = eventsCount > 0;
                  const isCurrentMonth = isSameMonth(day, calendarMonth);
                  const isToday = isSameDay(day, today);

                  return (
                    <Link
                      key={dateKey}
                      href="/portal/eventos"
                      title={
                        hasEvents
                          ? `${eventsCount} evento(s) em ${day.toLocaleDateString("pt-BR")}`
                          : `Sem eventos em ${day.toLocaleDateString("pt-BR")}`
                      }
                      className={`relative flex min-h-10 cursor-pointer flex-col items-center justify-center rounded-md border text-xs font-semibold transition-all duration-200 hover:border-accent hover:text-accent ${
                        hasEvents
                          ? "border-accent bg-accent text-accent-foreground hover:text-accent-foreground"
                          : "border-white/10 bg-white/[0.03] text-primary-foreground/75 dark:border-border dark:text-foreground/70"
                      } ${!isCurrentMonth ? "opacity-25" : ""} ${
                        isToday && !hasEvents
                          ? "border-accent/70 text-accent"
                          : ""
                      }`}
                    >
                      <span>{day.getDate()}</span>
                      {hasEvents ? (
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-current" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center gap-3 text-xs opacity-70">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Dias destacados indicam eventos cadastrados no mes.
              </div>
            </div>
          </article>
        </section>
      )}
    </div>
  );
}
