"use client";

import {
  Activity,
  CalendarDays,
  HandCoins,
  Loader2,
  RefreshCw,
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
import { listWorkers } from "@/features/workers/worker-service";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";

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
  const { clearSession } = useAuth();
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [schedules, setSchedules] = useState<ScheduleMap>({});
  const [summary, setSummary] = useState<DashboardSummary>(initialSummary);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const [
          eventsData,
          membersData,
          workersData,
          accountData,
          transactionsData,
        ] = await Promise.all([
          listEvents(),
          listMembers(),
          listWorkers(),
          getFinanceAccount(),
          listFinancialTransactions(),
        ]);
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
            membersCount: membersData.length,
            workersCount: workersData.length,
            financialBalance: accountData.balance,
            pendingTransactionsCount: transactionsData.filter(
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
  }, [clearSession, reloadKey, router]);

  const upcomingEvents = useMemo(() => getUpcomingEvents(events), [events]);
  const visibleUpcomingEvents = upcomingEvents.slice(0, 5);

  const summaryCards = [
    { label: "Membros ativos", value: String(summary.membersCount), icon: Users },
    { label: "Obreiros", value: String(summary.workersCount), icon: UserCog },
    {
      label: "Saldo financeiro",
      value: formatCurrency(summary.financialBalance),
      icon: HandCoins,
    },
    {
      label: "Eventos próximos",
      value: String(upcomingEvents.length),
      icon: CalendarDays,
    },
    {
      label: "Pendências",
      value: String(summary.pendingTransactionsCount),
      icon: Activity,
    },
  ];

  function refreshDashboard() {
    setReloadKey((current) => current + 1);
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="border border-border bg-surface p-5 shadow-sm"
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm font-medium text-muted">{card.label}</p>
                <span className="flex h-9 w-9 items-center justify-center bg-surface-subtle text-foreground">
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
        <div className="mt-6 grid gap-3 border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:flex sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={refreshDashboard}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="border border-border bg-surface p-5 shadow-sm">
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
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 border border-border px-4 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
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
            <div className="border border-dashed border-border bg-surface-subtle p-6 text-center">
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
                  className="border border-border bg-surface-subtle p-4"
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
                    <span className="w-fit border border-accent/40 bg-accent/10 px-2 py-1 text-xs font-semibold text-foreground">
                      {event.isRecurring ? "Recorrente" : "Avulso"}
                    </span>
                  </div>

                  <EventScheduleSummary
                    schedule={schedules[event.id]}
                    compact
                    emptyMessage="Ainda não há obreiros escalados para este evento."
                  />
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="border border-border bg-primary p-5 text-primary-foreground shadow-sm dark:bg-surface dark:text-foreground">
          <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-70">
            Rotina da semana
          </p>
          <h2 className="mt-3 text-xl font-semibold">Escalas em foco</h2>
          <p className="mt-3 text-sm leading-6 opacity-75">
            A Home mostra uma leitura rápida dos próximos compromissos. Para
            editar ou montar escalas, acesse o calendário de eventos.
          </p>
          <div className="mt-5 h-1 w-20 bg-accent" />
        </article>
      </section>
    </div>
  );
}