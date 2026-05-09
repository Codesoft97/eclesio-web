import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Church,
  HandCoins,
  LayoutDashboard,
  UserCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AnalyticsLink } from "@/components/analytics/analytics-link";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const features = [
  {
    title: "Cadastro e membros",
    description:
      "Centralize membros, WhatsApp e informações essenciais em uma base simples de consultar e manter atualizada.",
    icon: Users,
  },
  {
    title: "Agenda e eventos",
    description:
      "Organize cultos, reuniões, eventos recorrentes e links públicos para divulgação em poucos cliques.",
    icon: CalendarDays,
  },
  {
    title: "Escalas de obreiros",
    description:
      "Monte escalas por ministério e função, compartilhe links de confirmação e acompanhe aceites e recusas.",
    icon: UserCheck,
  },
  {
    title: "Financeiro da igreja",
    description:
      "Controle receitas, despesas, categorias, saldo e pendências com rastreabilidade desde o lançamento.",
    icon: HandCoins,
  },
  {
    title: "Painel de visão geral",
    description:
      "Veja rapidamente próximos eventos, escalas, membros ativos, obreiros, saldo financeiro e pendências.",
    icon: LayoutDashboard,
  },
];

const benefits = [
  "Menos planilhas soltas e grupos confusos no WhatsApp.",
  "Mais clareza para saber quem está escalado e quem confirmou presença.",
  "Rotina financeira mais organizada para decisões com responsabilidade.",
  "Uma base pronta para evoluir com relatórios, automações e comunicação.",
];

const plans = [
  {
    name: "Mensal",
    price: "39,90",
    period: "/mês",
    description:
      "Preço planejado para o lançamento comercial. Nesta fase, você pode testar gratuitamente.",
    highlight: false,
    badge: "Flexível",
    benefits: [
      "Cadastro de igreja e acesso administrativo.",
      "Gestão de membros, obreiros, ministérios e funções.",
      "Eventos, cultos recorrentes e compartilhamento de links.",
      "Escalas com aceite ou recusa por link exclusivo.",
      "Controle financeiro com receitas, despesas, saldo e pendências.",
      "Acesso gratuito nesta fase para testar e enviar feedback.",
    ],
  },
  {
    name: "Anual",
    price: "29,90",
    period: "/mês",
    description:
      "Economia em relação ao mensal.",
    highlight: true,
    badge: "Mais escolhido",
    benefits: [
      "Todos os recursos do plano mensal incluídos.",
      "Economia prevista em relação ao pagamento mês a mês quando houver cobrança.",
      "Planejamento anual de cultos, eventos e escalas com mais previsibilidade.",
      "Base financeira organizada para acompanhar a saúde da igreja mês a mês.",
      "Prioridade nas melhorias pensadas para rotinas recorrentes de igrejas.",
      "Valor anual previsto para a etapa comercial, ainda sem cobrança nesta fase.",
    ],
  },
];

const workflow = [
  "Cadastre sua igreja e seja o admin do sistema.",
  "Organize membros, obreiros, ministérios e funções.",
  "Crie eventos, cultos recorrentes e monte as escalas.",
  "Compartilhe confirmações e acompanhe a rotina no painel.",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
      {children}
    </p>
  );
}

function ProductScreenshot({
  src,
  alt,
  label,
}: {
  src: string;
  alt: string;
  label: string;
}) {
  return (
    <div className="relative overflow-hidden border border-border bg-surface p-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-2 pb-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          {label}
        </p>
        <span className="h-2.5 w-2.5 bg-accent" />
      </div>
      <div className="relative mt-3 aspect-[16/10] overflow-hidden border border-border bg-surface-subtle">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover object-top"
          priority={src === "/home_screenshot.png"}
        />
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="cursor-pointer" aria-label="Ir para início">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
            <a className="transition hover:text-foreground" href="#funcionalidades">
              Funcionalidades
            </a>
            <a className="transition hover:text-foreground" href="#planos">
              Planos
            </a>

          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden h-10 cursor-pointer items-center justify-center border border-border px-4 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent sm:inline-flex"
            >
              Entrar
            </Link>
            <AnalyticsLink
              href="/cadastro"
              eventName="landing_cta_clicked"
              eventProperties={{ location: "header", cta: "comecar" }}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 border border-accent bg-accent px-4 text-sm font-semibold text-accent-foreground transition hover:bg-yellow-400"
            >
              Começar
              <ArrowRight size={16} />
            </AnalyticsLink>
          </div>
        </div>
      </header>

      <section className="relative border-b border-border">
        <div className="absolute left-1/2 top-0 -z-0 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 border border-accent/40 bg-accent/10 px-3 py-2 text-xs font-semibold text-foreground">
              <Church size={15} className="text-accent" />
              Gestão moderna para igrejas em crescimento
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Organize a igreja inteira em um só lugar.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              O Eclesio ajuda sua igreja a cuidar de membros, eventos, escalas de obreiros e financeiro com uma rotina simples e pronta para crescer junto com o ministério. Você pode testar gratuitamente, sem cartão de crédito e sem assinar nada.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <AnalyticsLink
              href="/cadastro"
              eventName="landing_cta_clicked"
              eventProperties={{ location: "final", cta: "comecar_gratis" }}
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 border border-accent bg-accent px-6 text-sm font-semibold text-accent-foreground transition hover:bg-yellow-400"
            >
              Começar grátis
              <ArrowRight size={17} />
            </AnalyticsLink>
              <Link
                href="/login"
                className="inline-flex h-12 cursor-pointer items-center justify-center border border-border bg-surface px-6 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
              >
                Já tenho acesso
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                "Sem complicar a rotina",
                "Tudo em um só lugar",
                "Preparado para automações",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-muted">
                  <BadgeCheck size={16} className="text-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-8 -top-8 h-32 w-32 border border-accent/30" />
            <ProductScreenshot
              src="/home_screenshot.png"
              alt="Tela inicial do Eclesio com resumo, agenda e calendário mensal"
              label="Painel Eclesio"
            />
          </div>
        </div>
      </section>

      <section id="funcionalidades" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 max-w-3xl">
          <SectionLabel>Funcionalidades</SectionLabel>
          <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
            Tudo que a administração precisa, sem tirar o foco do cuidado pastoral.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            Comece pelo essencial e evolua com uma base organizada: pessoas, agenda, escalas, financeiro e visão de rotina.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group border border-border bg-surface p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center bg-surface-subtle text-foreground transition group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border bg-surface/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <ProductScreenshot
            src="/eventos_screenshot.png"
            alt="Tela de eventos do Eclesio com calendário mensal e escala de obreiros"
            label="Eventos e escalas"
          />
          <div className="flex flex-col justify-center">
            <SectionLabel>Operação mais leve</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              Menos improviso. Mais previsibilidade para servir bem.
            </h2>
            <div className="mt-8 grid gap-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex gap-3 border border-border bg-surface p-4">
                  <Check className="mt-0.5 shrink-0 text-accent" size={18} />
                  <p className="text-sm leading-6 text-muted">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="flex flex-col justify-center">
            <SectionLabel>Financeiro</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              Uma visão clara de receitas, despesas e saldo da igreja.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
              Acompanhe categorias, lançamentos pendentes, transações efetivadas e o saldo financeiro sem depender de planilhas espalhadas.
            </p>
            <div className="mt-6 grid gap-3">
              {[
                "Receitas e despesas organizadas por categoria",
                "Saldo atualizado a partir das transações efetivadas",
                "Pendências visíveis para manter a rotina em dia",
              ].map((item) => (
                <div key={item} className="flex gap-3 border border-border bg-surface p-4">
                  <Check className="mt-0.5 shrink-0 text-accent" size={18} />
                  <p className="text-sm leading-6 text-muted">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <ProductScreenshot
            src="/financeiro_screenshot.png"
            alt="Tela financeira do Eclesio com saldo e transações da igreja"
            label="Financeiro da igreja"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionLabel>Como funciona</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              Um fluxo simples para tirar a gestão do modo manual.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {workflow.map((step, index) => (
              <div key={step} className="border border-border bg-surface p-5">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                  Passo {index + 1}
                </span>
                <p className="mt-4 text-sm leading-7 text-muted">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section id="planos" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <SectionLabel>Planos</SectionLabel>
          <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
            Escolha o plano ideal para organizar sua igreja agora.
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            Gerencie as finanças da sua Igreja sem surpresas no fim do mês, gerencie e compartilhe eventos com os membros e muito mais, realize seu cadastro e faça o teste gratuito .
          </p>
          <div className="mt-6 border border-accent/40 bg-accent/10 p-4 text-sm font-semibold text-foreground">
            Basta criar a conta e testar gratuitamente sem adicionar cartão de crédito.
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative border p-6 shadow-sm ${
                plan.highlight
                  ? "border-accent bg-primary text-primary-foreground dark:bg-surface dark:text-foreground"
                  : "border-border bg-surface text-foreground"
              }`}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <span
                    className={`inline-flex border px-3 py-1 text-xs font-semibold ${
                      plan.highlight
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-surface-subtle text-foreground"
                    }`}
                  >
                    {plan.badge}
                  </span>
                  <h3 className="mt-5 text-2xl font-semibold">{plan.name}</h3>
                  <p className={`mt-3 text-sm leading-7 ${plan.highlight ? "opacity-75" : "text-muted"}`}>
                    {plan.description}
                  </p>
                </div>
              </div>

              <div className="mb-6 border-y border-current/10 py-6">
                <div className="flex items-end gap-1">
                  <span className="text-sm font-semibold">R$</span>
                  <span className="text-5xl font-semibold tracking-tight">{plan.price}</span>
                  <span className={`pb-2 text-sm ${plan.highlight ? "opacity-70" : "text-muted"}`}>
                    {plan.period}
                  </span>
                </div>
                {plan.name === "Anual" ? (
                  <p className="mt-2 text-xs opacity-70">Preço previsto para cobrança anual futura.</p>
                ) : (
                  <p className="mt-2 text-xs text-muted">Preço previsto para cobrança mensal futura.</p>
                )}
              </div>

              <div className="grid gap-3">
                {plan.benefits.map((benefit) => (
                  <div key={benefit} className="flex gap-3 text-sm leading-6">
                    <Check className="mt-0.5 shrink-0 text-accent" size={17} />
                    <span className={plan.highlight ? "opacity-85" : "text-muted"}>{benefit}</span>
                  </div>
                ))}
              </div>

              <AnalyticsLink
                href="/cadastro"
                eventName="landing_plan_cta_clicked"
                eventProperties={{ plan: plan.name, price: plan.price }}
                className={`mt-8 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 border px-5 text-sm font-semibold transition ${
                  plan.highlight
                    ? "border-accent bg-accent text-accent-foreground hover:bg-yellow-400"
                    : "border-border bg-surface-subtle text-foreground hover:border-accent hover:text-accent"
                }`}
              >
                Testar grátis
                <ArrowRight size={17} />
              </AnalyticsLink>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="grid gap-8 border border-border bg-surface p-6 shadow-sm lg:grid-cols-[1fr_0.8fr] lg:p-10">
          <div>
            <SectionLabel>Próximo passo</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold text-foreground">
              Pronto para transformar a rotina administrativa da igreja?
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
              Comece com o cadastro da igreja, teste todas as funcionalidades gratuitamente e conte para nós o que faria mais sentido na rotina real da sua igreja.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row lg:flex-col">
            <AnalyticsLink
              href="/cadastro"
              eventName="landing_cta_clicked"
              eventProperties={{ location: "final", cta: "comecar_gratis" }}
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 border border-accent bg-accent px-6 text-sm font-semibold text-accent-foreground transition hover:bg-yellow-400"
            >
              Começar grátis
              <ArrowRight size={17} />
            </AnalyticsLink>
            <Link
              href="/login"
              className="inline-flex h-12 cursor-pointer items-center justify-center border border-border px-6 text-sm font-semibold text-foreground transition hover:border-accent hover:text-accent"
            >
              Acessar sistema
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-surface/60 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.3fr_0.7fr_0.7fr_0.9fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
              Gestão de igrejas simples, organizada e preparada para quem vive a rotina ministerial.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Acessos rápidos</h3>
            <div className="mt-4 grid gap-3 text-sm text-muted">
              <a className="transition hover:text-foreground" href="#funcionalidades">
                Funcionalidades
              </a>
              <a className="transition hover:text-foreground" href="#planos">
                Planos
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Redes sociais</h3>
            <div className="mt-4 grid gap-3 text-sm text-muted">
              <a
                className="transition hover:text-foreground"
                href="https://instagram.com/eclesioapp"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Contato</h3>
            <div className="mt-4 grid gap-3 text-sm text-muted">
              <a
                className="break-all transition hover:text-foreground"
                href="mailto:eclesioapp@gmail.com"
              >
                eclesioapp@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-col justify-between gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <span>Eclesio - Gestão de igrejas</span>
          <span>Feito para servir melhor, com organização e clareza.</span>
        </div>
      </footer>
    </main>
  );
}