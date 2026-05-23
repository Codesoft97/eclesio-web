"use client";

import {
  Activity,
  CalendarDays,
  HandCoins,
  Loader2,
  RefreshCw,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { EventScheduleSummary } from "@/features/events/components/event-schedule-summary";
import { getEventSchedule, listEvents } from "@/features/events/event-service";
import type { ChurchEvent, EventSchedule } from "@/features/events/event-types";
import {
  getFinanceAccount,
  listFinancialTransactions,
} from "@/features/finance/finance-service";
import { listMembers } from "@/features/members/member-service";
import {
  canTryCompletePlan,
  hasCompletePlan,
} from "@/features/subscriptions/subscription-features";
import { upgradeTrialToComplete } from "@/features/subscriptions/subscription-service";
import { listWorkers } from "@/features/workers/worker-service";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";
import { fetchAllPaginatedItems, MAX_PAGE_SIZE } from "@/lib/pagination";

type ScheduleMap = Record<string, EventSchedule>;

interface DashboardSummary {
  membersCount: number;
  workersCount: number;
  financialBalance: string;
  pendingTransactionsCount: number;
}

const initialSummary: DashboardSummary = {
  membersCount: 0,
  workersCount: 0,
  financialBalance: "0.00",
  pendingTransactionsCount: 0,
};

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

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatCurrency(value: string) {
  const amount = Number(value);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatMonthTitle(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(value);
}

function getUpcomingEvents(events: ChurchEvent[]) {
  const now = new Date();

  return events
    .filter((event) => new Date(event.startsAt).getTime() >= now.getTime())
    .sort(
      (firstEvent, secondEvent) =>
        new Date(firstEvent.startsAt).getTime() -
        new Date(secondEvent.startsAt).getTime(),
    );
}

export default function DashboardPage() {
  const router = useRouter();
  const { session, setSession, clearSession } = useAuth();
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [schedules, setSchedules] = useState<ScheduleMap>({});
  const [summary, setSummary] = useState<DashboardSummary>(initialSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpgradingTrial, setIsUpgradingTrial] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [calendarMonth] = useState(() => startOfMonth(new Date()));
  const [today] = useState(() => new Date());
  const canAccessCompleteFeatures = hasCompletePlan(session?.subscription);
  const canTryComplete = canTryCompletePlan(session?.subscription);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const [eventsData, workersData] = await Promise.all([
          fetchAllPaginatedItems(listEvents),
          listWorkers({ limit: MAX_PAGE_SIZE }),
        ]);
        const completeData = canAccessCompleteFeatures
          ? await Promise.all([
              listMembers({ limit: MAX_PAGE_SIZE }),
              getFinanceAccount(),
              listFinancialTransactions({ limit: MAX_PAGE_SIZE }),
            ])
          : null;
        const upcomingEvents = getUpcomingEvents(eventsData).slice(0, 5);
        const scheduleEntries = await Promise.all(
          upcomingEvents.map(async (event) => [
            event.id,
            await getEventSchedule(event.id),
          ] as const),
        );

        if (!ignore) {
          setEvents(eventsData);
          setSchedules(Object.fromEntries(scheduleEntries));
          setSummary({
            membersCount: completeData?.[0].meta.totalItems ?? 0,
            workersCount: workersData.meta.totalItems,
            financialBalance: completeData?.[1].balance ?? "0.00",
            pendingTransactionsCount: (completeData?.[2].items ?? []).filter(
              (transaction) => !transaction.isEffective,
            ).length,
          });
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
  }, [canAccessCompleteFeatures, clearSession, reloadKey, router]);

  const upcomingEvents = useMemo(() => getUpcomingEvents(events), [events]);
  const visibleUpcomingEvents = upcomingEvents.slice(0, 5);
  const calendarDays = useMemo(
    () => getCalendarDays(calendarMonth),
    [calendarMonth],
  );
  const eventCountsByDate = useMemo(() => {
    const counts = new Map<string, number>();

    for (const event of events) {
      const eventDate = new Date(event.startsAt);

      if (!isSameMonth(eventDate, calendarMonth)) {
        continue;
      }

      const dateKey = getDateKey(eventDate);
      counts.set(dateKey, (counts.get(dateKey) ?? 0) + 1);
    }

    return counts;
  }, [calendarMonth, events]);
  const calendarMonthEventsCount = Array.from(eventCountsByDate.values()).reduce(
    (total, count) => total + count,
    0,
  );

  const summaryCards = [
    ...(canAccessCompleteFeatures
      ? [
          {
            label: "Membros ativos",
            value: String(summary.membersCount),
            icon: Users,
          },
        ]
      : []),
    { label: "Obreiros", value: String(summary.workersCount), icon: UserCog },
    ...(canAccessCompleteFeatures
      ? [
          {
            label: "Saldo financeiro",
            value: formatCurrency(summary.financialBalance),
            icon: HandCoins,
          },
        ]
      : []),
    {
      label: "Eventos próximos",
      value: String(upcomingEvents.length),
      icon: CalendarDays,
    },
    ...(canAccessCompleteFeatures
      ? [
          {
            label: "Pendências",
            value: String(summary.pendingTransactionsCount),
            icon: Activity,
          },
        ]
      : []),
  ];

  function refreshDashboard() {
    setReloadKey((current) => current + 1);
  }

  async function handleUpgradeTrial() {
    if (!session) {
      return;
    }

    setIsUpgradingTrial(true);
    setError(null);

    try {
      const data = await upgradeTrialToComplete();
      setSession({
        ...session,
        subscription: data.subscription,
      });
      setReloadKey((current) => current + 1);
    } catch (err) {
      if (isUnauthorizedApiError(err)) {
        clearSession();
        router.push("/login");
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setIsUpgradingTrial(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Painel
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Visão geral
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Acompanhe rapidamente a agenda da igreja, o financeiro e quem está
            escalado para os próximos eventos.
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

      {canTryComplete ? (
        <section className="mb-6 rounded-xl border border-accent/40 bg-accent/10 p-5 shadow-sm">
          <div className="grid gap-4 md:flex md:items-center md:justify-between">
            <div className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Sparkles size={20} />
              </span>
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                  Teste gratuito
                </p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  Você pode testar o plano completo agora
                </h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
                  Libere membros, financeiro, comunicados, doações, relatórios
                  e portal dos membros até o fim do seu período de teste.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => void handleUpgradeTrial()}
              disabled={isUpgradingTrial}
            >
              {isUpgradingTrial ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Sparkles size={17} />
              )}
              Testar completo
            </Button>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm font-medium text-muted">{card.label}</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
                  <Icon size={17} />
                </span>
              </div>
              <p className="text-3xl font-semibold text-foreground">
                {card.value}
              </p>
            </article>
          );
        })}
      </section>

      {error ? (
        <div className="mt-6 grid gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:flex sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={refreshDashboard}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="mb-5 grid gap-3 border-b border-border pb-4 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                Próxima agenda
              </p>
              <h2 className="mt-2 text-lg font-semibold text-foreground">
                Eventos e escalas
              </h2>
            </div>
            <Link
              href="/app/eventos"
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent hover:text-accent"
            >
              Ver calendário
            </Link>
          </div>

          {isLoading ? (
            <div className="grid min-h-72 place-items-center text-center text-sm text-muted">
              <div>
                <Loader2 className="mx-auto mb-3 animate-spin text-accent" size={24} />
                Carregando próximos eventos...
              </div>
            </div>
          ) : visibleUpcomingEvents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-surface-subtle p-6 text-center">
              <CalendarDays className="mx-auto mb-3 text-muted" size={26} />
              <h3 className="text-base font-semibold text-foreground">
                Nenhum evento próximo
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Crie eventos no calendário para acompanhar as próximas escalas por aqui.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {visibleUpcomingEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-lg border border-border bg-surface-subtle p-4 transition-shadow duration-300 hover:shadow-sm"
                >
                  <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                        {formatEventDate(event.startsAt)}
                      </p>
                      <h3 className="mt-2 text-base font-semibold text-foreground">
                        {event.title}
                      </h3>
                    </div>
                    <span className="w-fit rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-xs font-semibold text-foreground">
                      {event.isRecurring ? "Recorrente" : "Avulso"}
                    </span>
                  </div>

                  <EventScheduleSummary
                    schedule={schedules[event.id]}
                    compact
                    eventTitle={event.title}
                    eventStartsAt={event.startsAt}
                    emptyMessage="Ainda não há obreiros escalados para este evento."
                  />
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="rounded-xl border border-border bg-primary p-5 text-primary-foreground shadow-sm dark:bg-surface dark:text-foreground">
          <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-70">
            Rotina da semana
          </p>
          <h2 className="mt-3 text-xl font-semibold">Eventos do mês</h2>
          <div className="mt-5 h-1 w-20 rounded-full bg-accent" />

          <div className="mt-7 rounded-lg border border-white/10 bg-white/[0.04] p-4 dark:border-border dark:bg-surface-subtle">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] opacity-60">
                  Calendário do mês
                </p>
                <h3 className="mt-1 text-base font-semibold capitalize">
                  {formatMonthTitle(calendarMonth)}
                </h3>
              </div>
              <span className="rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-xs font-semibold text-accent">
                {calendarMonthEventsCount} evento(s)
              </span>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase tracking-[0.12em] opacity-55">
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
                    href="/app/eventos"
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
                      isToday && !hasEvents ? "border-accent/70 text-accent" : ""
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
              Dias destacados indicam eventos cadastrados no mês.
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
