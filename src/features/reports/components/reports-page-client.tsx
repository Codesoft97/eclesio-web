"use client";

import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Loader2,
  RefreshCw,
  Repeat2,
  TrendingDown,
  TrendingUp,
  UserCheck,
  XCircle,
} from "lucide-react";

import { RechartsBar, RechartsDonut, RechartsStacked } from "./report-charts";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import {
  getEventSchedule,
  listEvents,
} from "@/features/events/event-service";
import type {
  ChurchEvent,
  EventSchedule,
  EventScheduleAssignment,
  EventScheduleConfirmationStatus,
} from "@/features/events/event-types";
import {
  getFinanceCategories,
  listFinancialTransactions,
} from "@/features/finance/finance-service";
import type {
  FinancialCategories,
  FinancialTransaction,
  FinancialTransactionCategory,
  FinancialTransactionType,
} from "@/features/finance/finance-types";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";
import { fetchAllPaginatedItems } from "@/lib/pagination";

type ScheduleMap = Record<string, EventSchedule>;

type ChartItem = {
  label: string;
  value: number;
  displayValue?: string;
};

const defaultCategories: FinancialCategories = {
  revenue: [
    { value: "OFFERINGS", label: "Ofertas" },
    { value: "TITHES", label: "Dízimos" },
    { value: "DONATIONS", label: "Doações" },
  ],
  expense: [
    { value: "MAINTENANCE", label: "Manutenção" },
    { value: "FOOD", label: "Alimentação" },
    { value: "INSTRUMENTS", label: "Instrumentos" },
    { value: "TECHNOLOGY", label: "Tecnologia" },
    { value: "FURNITURE", label: "Móveis" },
    { value: "STRUCTURE", label: "Estrutura" },
  ],
};

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const confirmationStatusDetails: Record<
  EventScheduleConfirmationStatus,
  { label: string; icon: typeof Clock3; className: string }
> = {
  PENDING: {
    label: "Pendentes",
    icon: Clock3,
    className: "bg-accent text-accent-foreground",
  },
  ACCEPTED: {
    label: "Aceites",
    icon: CheckCircle2,
    className: "bg-success text-white",
  },
  DECLINED: {
    label: "Recusas",
    icon: XCircle,
    className: "bg-danger text-white",
  },
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getCurrentMonthValue() {
  const today = new Date();
  return `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
}

function addMonths(monthValue: string, amount: number) {
  const [year, month] = monthValue.split("-").map(Number);
  const date = new Date(year, month - 1 + amount, 1);

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function isSameMonth(value: string, monthValue: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}` === monthValue;
}

function formatMonthTitle(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatCurrency(value: number | string) {
  const amount = Number(value);

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0,
    style: "percent",
  }).format(value);
}

function buildCategoryMap(categories: FinancialCategories) {
  return [...categories.revenue, ...categories.expense].reduce<
    Record<FinancialTransactionCategory, string>
  >(
    (accumulator, category) => ({
      ...accumulator,
      [category.value]: category.label,
    }),
    {} as Record<FinancialTransactionCategory, string>,
  );
}

function sumTransactions(
  transactions: FinancialTransaction[],
  predicate: (transaction: FinancialTransaction) => boolean,
) {
  return transactions
    .filter(predicate)
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
}

function groupTransactionsByCategory({
  transactions,
  categories,
  type,
}: {
  transactions: FinancialTransaction[];
  categories: FinancialCategories;
  type: FinancialTransactionType;
}) {
  const availableCategories =
    type === "REVENUE" ? categories.revenue : categories.expense;

  return availableCategories
    .map((category) => {
      const value = sumTransactions(
        transactions,
        (transaction) =>
          transaction.type === type && transaction.category === category.value,
      );

      return {
        label: category.label,
        value,
        displayValue: formatCurrency(value),
      };
    })
    .filter((item) => item.value > 0)
    .sort((firstItem, secondItem) => secondItem.value - firstItem.value);
}

function groupEventsByWeekday(events: ChurchEvent[]) {
  return weekDays.map((weekday, index) => {
    const value = events.filter(
      (event) => new Date(event.startsAt).getDay() === index,
    ).length;

    return {
      label: weekday,
      value,
      displayValue: `${value} evento(s)`,
    };
  });
}

function groupEventsByWeek(events: ChurchEvent[]) {
  return Array.from({ length: 6 }, (_, index) => {
    const week = index + 1;
    const value = events.filter((event) => {
      const day = new Date(event.startsAt).getDate();
      return Math.ceil(day / 7) === week;
    }).length;

    return {
      label: `Sem ${week}`,
      value,
      displayValue: `${value} evento(s)`,
    };
  }).filter((item) => item.value > 0);
}

function groupAssignmentsByMinistry(assignments: EventScheduleAssignment[]) {
  const grouped = assignments.reduce<Record<string, number>>(
    (accumulator, assignment) => ({
      ...accumulator,
      [assignment.ministry.name]:
        (accumulator[assignment.ministry.name] ?? 0) + 1,
    }),
    {},
  );

  return Object.entries(grouped)
    .map(([label, value]) => ({
      label,
      value,
      displayValue: `${value} escala(s)`,
    }))
    .sort((firstItem, secondItem) => secondItem.value - firstItem.value);
}

function countAssignmentsByStatus(assignments: EventScheduleAssignment[]) {
  return Object.entries(confirmationStatusDetails).map(([status, details]) => {
    const value = assignments.filter(
      (assignment) => assignment.confirmationStatus === status,
    ).length;

    return {
      status: status as EventScheduleConfirmationStatus,
      label: details.label,
      value,
      displayValue: `${value} pessoa(s)`,
      icon: details.icon,
      className: details.className,
    };
  });
}

function getAssignments(schedules: ScheduleMap) {
  return Object.values(schedules).flatMap((schedule) => schedule.assignments);
}

function getScheduleCoverage(events: ChurchEvent[], schedules: ScheduleMap) {
  const withSchedule = events.filter(
    (event) => (schedules[event.id]?.assignments.length ?? 0) > 0,
  ).length;
  const withoutSchedule = Math.max(events.length - withSchedule, 0);

  return [
    {
      label: "Com escala",
      value: withSchedule,
      displayValue: `${withSchedule} evento(s)`,
    },
    {
      label: "Sem escala",
      value: withoutSchedule,
      displayValue: `${withoutSchedule} evento(s)`,
    },
  ];
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof BarChart3;
  tone?: "default" | "success" | "danger" | "accent";
}) {
  const toneClass = {
    default: "bg-surface-subtle text-foreground",
    success: "bg-success/10 text-success",
    danger: "bg-danger/10 text-danger",
    accent: "bg-accent text-accent-foreground",
  }[tone];

  return (
    <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
            {value}
          </p>
        </div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center ${toneClass}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="text-sm leading-6 text-muted">{helper}</p>
    </article>
  );
}




function StatusCards({
  data,
}: {
  data: ReturnType<typeof countAssignmentsByStatus>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {data.map((item) => {
        const Icon = item.icon;

        return (
          <article key={item.status} className="rounded-lg border border-border bg-surface-subtle p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-muted">{item.label}</p>
              <span className={`flex h-9 w-9 items-center justify-center ${item.className}`}>
                <Icon size={17} />
              </span>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {item.value}
            </p>
          </article>
        );
      })}
    </div>
  );
}

function ChartCard({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-5 border-b border-border pb-4">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
      </div>
      {children}
    </section>
  );
}

export function ReportsPageClient() {
  const router = useRouter();
  const { clearSession } = useAuth();
  const [visibleMonth, setVisibleMonth] = useState(getCurrentMonthValue);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [categories, setCategories] =
    useState<FinancialCategories>(defaultCategories);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [schedules, setSchedules] = useState<ScheduleMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadReports() {
      setIsLoading(true);
      setError(null);

      try {
        const [categoriesData, transactionsData, eventsData] =
          await Promise.all([
            getFinanceCategories(),
            fetchAllPaginatedItems((pagination) =>
              listFinancialTransactions({
                month: visibleMonth,
                ...pagination,
              }),
            ),
            fetchAllPaginatedItems(listEvents),
          ]);
        const monthEvents = eventsData.filter((event) =>
          isSameMonth(event.startsAt, visibleMonth),
        );
        const scheduleEntries = await Promise.all(
          monthEvents.map(
            async (event) =>
              [event.id, await getEventSchedule(event.id)] as const,
          ),
        );

        if (!ignore) {
          setCategories(categoriesData);
          setTransactions(transactionsData);
          setEvents(monthEvents);
          setSchedules(Object.fromEntries(scheduleEntries));
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

    void loadReports();

    return () => {
      ignore = true;
    };
  }, [clearSession, reloadKey, router, visibleMonth]);

  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);
  const assignments = useMemo(() => getAssignments(schedules), [schedules]);
  const revenueByCategory = useMemo(
    () =>
      groupTransactionsByCategory({
        transactions,
        categories,
        type: "REVENUE",
      }),
    [categories, transactions],
  );
  const expenseByCategory = useMemo(
    () =>
      groupTransactionsByCategory({
        transactions,
        categories,
        type: "EXPENSE",
      }),
    [categories, transactions],
  );
  const eventsByWeekday = useMemo(() => groupEventsByWeekday(events), [events]);
  const eventsByWeek = useMemo(() => groupEventsByWeek(events), [events]);
  const assignmentsByMinistry = useMemo(
    () => groupAssignmentsByMinistry(assignments),
    [assignments],
  );
  const assignmentsByStatus = useMemo(
    () => countAssignmentsByStatus(assignments),
    [assignments],
  );
  const scheduleCoverage = useMemo(
    () => getScheduleCoverage(events, schedules),
    [events, schedules],
  );

  const revenueTotal = sumTransactions(
    transactions,
    (transaction) => transaction.type === "REVENUE",
  );
  const expenseTotal = sumTransactions(
    transactions,
    (transaction) => transaction.type === "EXPENSE",
  );
  const netResult = revenueTotal - expenseTotal;
  const recurringEventsCount = events.filter((event) => event.isRecurring).length;
  const scheduledEventsCount = scheduleCoverage[0]?.value ?? 0;
  const acceptedAssignments = assignmentsByStatus.find(
    (item) => item.status === "ACCEPTED",
  )?.value ?? 0;
  const confirmationRate = assignments.length
    ? acceptedAssignments / assignments.length
    : 0;

  function goToPreviousMonth() {
    setVisibleMonth((current) => addMonths(current, -1));
  }

  function goToNextMonth() {
    setVisibleMonth((current) => addMonths(current, 1));
  }

  function refreshReports() {
    setReloadKey((current) => current + 1);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border pb-5 sm:mb-8 sm:pb-6 xl:flex-row xl:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Inteligência
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Relatórios
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Acompanhe finanças, eventos e escalas em uma leitura mensal para apoiar decisões rápidas da igreja.
          </p>
        </div>

        <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
          <Button type="button" variant="ghost" onClick={goToPreviousMonth}>
            <ArrowLeft size={16} />
            Anterior
          </Button>
          <input
            type="month"
            className="h-11 min-w-40 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-foreground transition-all duration-200 focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none"
            value={visibleMonth}
            onChange={(event) => setVisibleMonth(event.target.value)}
            aria-label="Selecionar mês"
          />
          <Button type="button" variant="ghost" onClick={goToNextMonth}>
            Próximo
            <ArrowRight size={16} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={refreshReports}
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

      {error ? (
        <div className="mb-4 grid gap-3 border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:flex sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={refreshReports}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid min-h-96 place-items-center border border-border bg-surface p-8 text-center text-sm text-muted shadow-sm">
          <div>
            <Loader2 className="mx-auto mb-3 animate-spin text-accent" size={26} />
            Carregando relatórios de {formatMonthTitle(visibleMonth)}...
          </div>
        </div>
      ) : (
        <div className="grid gap-5">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Receitas do mês"
              value={formatCurrency(revenueTotal)}
              helper="Soma das transações de receita no período selecionado."
              icon={TrendingUp}
              tone="success"
            />
            <MetricCard
              label="Despesas do mês"
              value={formatCurrency(expenseTotal)}
              helper="Soma das transações de despesa no período selecionado."
              icon={TrendingDown}
              tone="danger"
            />
            <MetricCard
              label="Resultado líquido"
              value={formatCurrency(netResult)}
              helper="Diferença entre receitas e despesas deste mês."
              icon={CircleDollarSign}
              tone={netResult >= 0 ? "accent" : "danger"}
            />
            <MetricCard
              label="Eventos com escala"
              value={`${scheduledEventsCount}/${events.length}`}
              helper="Quantidade de eventos do mês que já possuem obreiros escalados."
              icon={UserCheck}
              tone="default"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <ChartCard
              eyebrow="Financeiro"
              title="Receitas por categoria"
              description="Mostra quais fontes de receita mais contribuíram no mês."
            >
              <RechartsDonut
                data={revenueByCategory}
                emptyMessage="Nenhuma receita cadastrada neste mês."
                formatter={formatCurrency}
              />
            </ChartCard>

            <ChartCard
              eyebrow="Financeiro"
              title="Despesas por categoria"
              description="Ajuda a identificar onde os recursos estão sendo consumidos."
            >
              <RechartsDonut
                data={expenseByCategory}
                emptyMessage="Nenhuma despesa cadastrada neste mês."
                formatter={formatCurrency}
              />
            </ChartCard>
          </section>

          <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
            <ChartCard
              eyebrow="Eventos"
              title={`Eventos por semana em ${formatMonthTitle(visibleMonth)}`}
              description="Distribuição dos compromissos ao longo do mês selecionado."
            >
              <RechartsBar
                data={eventsByWeek}
                emptyMessage="Nenhum evento cadastrado neste mês."
                color="accent"
              />
            </ChartCard>

            <ChartCard
              eyebrow="Eventos"
              title="Perfil da agenda"
              description="Leitura rápida entre eventos recorrentes e avulsos."
            >
              <div className="grid gap-4">
                <RechartsDonut
                  data={[
                    { label: "Recorrentes", value: recurringEventsCount },
                    { label: "Avulsos", value: Math.max(events.length - recurringEventsCount, 0) },
                  ]}
                  emptyMessage="Nenhum evento cadastrado neste mês."
                />
                <div className="rounded-lg border border-border bg-surface-subtle p-4 text-sm text-muted">
                  <div className="mb-3 flex items-center gap-2 text-foreground">
                    <Repeat2 size={16} className="text-accent" />
                    <strong>Recorrência</strong>
                  </div>
                  {events.length > 0
                    ? `${formatPercent(recurringEventsCount / events.length)} da agenda do mês é recorrente.`
                    : "Ainda não há dados de agenda para calcular recorrência."}
                </div>
              </div>
            </ChartCard>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <ChartCard
              eyebrow="Eventos"
              title="Eventos por dia da semana"
              description="Mostra em quais dias a agenda da igreja está mais concentrada."
            >
              <RechartsBar
                data={eventsByWeekday.filter((item) => item.value > 0)}
                emptyMessage="Nenhum evento cadastrado neste mês."
                color="accent"
                layout="vertical"
              />
            </ChartCard>

            <ChartCard
              eyebrow="Escalas"
              title="Cobertura de escalas"
              description="Compara eventos com escala montada e eventos ainda sem escala."
            >
              <RechartsDonut
                data={scheduleCoverage}
                emptyMessage="Nenhum evento cadastrado neste mês."
              />
            </ChartCard>
          </section>

          <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
            <ChartCard
              eyebrow="Escalas"
              title="Status das confirmações"
              description="Acompanhe o retorno dos obreiros escalados no período."
            >
              <div className="grid gap-4">
                <StatusCards data={assignmentsByStatus} />
                <div className="rounded-lg border border-border bg-surface-subtle p-4 text-sm text-muted">
                  Taxa de aceite: <strong className="text-foreground">{formatPercent(confirmationRate)}</strong>
                </div>
              </div>
            </ChartCard>

            <ChartCard
              eyebrow="Escalas"
              title="Obreiros escalados por ministério"
              description="Mostra quais ministérios concentram mais escalas no mês."
            >
              <RechartsBar
                data={assignmentsByMinistry}
                emptyMessage="Nenhuma escala cadastrada para eventos deste mês."
                color="accent"
                layout="vertical"
              />
            </ChartCard>
          </section>

          <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <div className="mb-5 border-b border-border pb-4">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                Resumo operacional
              </p>
              <h2 className="mt-2 text-lg font-semibold text-foreground">
                Leituras rápidas do mês
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-surface-subtle p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <CalendarDays size={18} />
                </div>
                <p className="text-sm text-muted">Eventos cadastrados</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatNumber(events.length)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface-subtle p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-foreground">
                  <UserCheck size={18} />
                </div>
                <p className="text-sm text-muted">Obreiros em escalas</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatNumber(assignments.length)}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface-subtle p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-surface text-foreground">
                  <BarChart3 size={18} />
                </div>
                <p className="text-sm text-muted">Categorias movimentadas</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatNumber(
                    new Set(transactions.map((transaction) => categoryMap[transaction.category])).size,
                  )}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
