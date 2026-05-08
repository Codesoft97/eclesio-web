import { Activity, CalendarDays, HandCoins, Users } from "lucide-react";

const summaryCards = [
  { label: "Membros ativos", value: "0", icon: Users },
  { label: "Dizimos no mes", value: "R$ 0,00", icon: HandCoins },
  { label: "Eventos proximos", value: "0", icon: CalendarDays },
  { label: "Pendencias", value: "0", icon: Activity },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Painel</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">Visao geral</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Uma primeira tela operacional para acompanhar indicadores e atalhos. Os dados reais entram nas proximas etapas.
          </p>
        </div>
        <div className="border border-border bg-surface px-4 py-3 text-sm text-muted">
          Ambiente inicial
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article key={card.label} className="border border-border bg-surface p-5 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm font-medium text-muted">{card.label}</p>
                <span className="flex h-9 w-9 items-center justify-center bg-surface-subtle text-foreground">
                  <Icon size={17} />
                </span>
              </div>
              <p className="text-3xl font-semibold text-foreground">{card.value}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="border border-border bg-surface p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Atividade recente</h2>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Hoje</span>
          </div>
          <div className="grid gap-3">
            {["Cadastro de membros", "Agenda da semana", "Lancamentos financeiros"].map((item) => (
              <div key={item} className="flex items-center justify-between border border-border bg-surface-subtle p-3 text-sm">
                <span className="text-foreground">{item}</span>
                <span className="text-muted">Aguardando modulo</span>
              </div>
            ))}
          </div>
        </article>

        <article className="border border-border bg-primary p-5 text-primary-foreground shadow-sm dark:bg-surface">
          <p className="font-mono text-xs uppercase tracking-[0.18em] opacity-70">Proximo passo</p>
          <h2 className="mt-3 text-xl font-semibold">Definir o modulo de membros</h2>
          <p className="mt-3 text-sm leading-6 opacity-75">
            A navegacao ja esta pronta para receber telas internas. Podemos seguir com membros, dizimos, eventos ou permissoes.
          </p>
          <div className="mt-5 h-1 w-20 bg-accent" />
        </article>
      </section>
    </div>
  );
}