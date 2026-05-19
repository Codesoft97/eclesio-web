import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  CalendarDays,
  Check,
  Church,
  Clock3,
  HandCoins,
  HeartHandshake,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Send,
  UserCheck,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AnalyticsLink } from "@/components/analytics/analytics-link";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const WHATSAPP_CONTACT_URL = `https://wa.me/5551991986528?text=${encodeURIComponent(
  "Olá! Quero conhecer o Gerencia Igreja.",
)}`;

const features = [
  {
    title: "Escalas de obreiros",
    description:
      "Monte escalas por ministério e função, envie confirmações pelo WhatsApp e acompanhe aceites e recusas.",
    icon: UserCheck,
  },
  {
    title: "Agenda e eventos",
    description:
      "Organize cultos, reuniões, eventos recorrentes e escalas vinculadas em poucos cliques.",
    icon: CalendarDays,
  },
  {
    title: "WhatsApp automático",
    description:
      "Envie o convite da escala ao obreiro e lembre quem ainda não respondeu um dia antes do evento.",
    icon: MessageCircle,
  },
  {
    title: "Cadastro e membros",
    description:
      "Centralize membros, WhatsApp e informações essenciais em uma base simples de consultar e manter atualizada.",
    icon: Users,
  },
  {
    title: "Portal dos membros",
    description:
      "Dê aos membros um acesso próprio para acompanhar eventos, comunicados, doações e escalas quando forem obreiros.",
    icon: Church,
  },
  {
    title: "Financeiro da igreja",
    description:
      "Controle receitas, despesas, categorias, saldo e pendências com rastreabilidade desde o lançamento.",
    icon: HandCoins,
  },
  {
    title: "Doações via Pix",
    description:
      "Crie objetivos de doação com chave Pix, QR Code e Pix copia e cola para os membros contribuírem com clareza.",
    icon: HeartHandshake,
  },
  {
    title: "Comunicados",
    description:
      "Publique avisos para manter os membros informados sobre recados importantes da igreja em um só lugar.",
    icon: Megaphone,
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
  "Uma base pronta para evoluir com relatórios, automações e comunicação.",
];

const plans = [
  {
    name: "Mensal",
    price: "49,90",
    period: "/mês",
    description:
      "Você pode testar gratuitamente durante 14 dias sem assinar nada ainda.",
    highlight: false,
    badge: "Flexível",
    benefits: [
      "Cadastro de igreja e acesso administrativo.",
      "Gestão de membros, obreiros, ministérios e funções.",
      "Eventos, cultos recorrentes e comunicados para os membros.",
      "Escalas com envio automático para os obreiros.",
      "Controle financeiro com receitas, despesas, saldo e pendências.",
      "Portal exclusivo para membros e obreiros.",
      "Acesso gratuito durante 14 dias.",
    ],
  },
  {
    name: "Anual",
    price: "39,90",
    period: "/mês",
    description: "Economia em relação ao mensal.",
    highlight: true,
    badge: "Mais escolhido",
    benefits: [
      "Todos os recursos do plano mensal incluídos.",
      "Economia prevista em relação ao pagamento mês a mês quando houver cobrança.",
      "Planejamento anual de cultos, eventos e escalas com mais previsibilidade.",
      "Base financeira organizada para acompanhar a saúde da igreja mês a mês.",
      "Prioridade nas melhorias pensadas para rotinas recorrentes de igrejas.",
    ],
  },
];

const faqItems = [
  {
    question: "O Gerencia Igreja substitui planilhas e grupos de WhatsApp?",
    answer:
      "Ele centraliza a rotina principal da igreja: membros, obreiros, eventos, escalas, financeiro, comunicados e doações. O WhatsApp continua sendo usado onde faz sentido, como no envio automático das escalas para os obreiros.",
  },
  {
    question: "Como funciona o envio automático das escalas?",
    answer:
      "Quando um obreiro é vinculado à escala de um evento, ele recebe uma mensagem no WhatsApp com o link da própria escala. Um dia antes do evento, quem ainda estiver pendente recebe um lembrete automático.",
  },
  {
    question: "Os membros também conseguem acessar o sistema?",
    answer:
      "Sim. O portal dos membros permite acompanhar eventos, comunicados, doações e, quando o membro também for obreiro, suas escalas com opção de aceitar ou recusar.",
  },
  {
    question: "Consigo controlar financeiro e doações?",
    answer:
      "Sim. O administrador pode registrar receitas e despesas, criar categorias financeiras e cadastrar objetivos de doação com Pix copia e cola e QR Code para os membros.",
  },
  {
    question: "Preciso cadastrar cartão para testar?",
    answer:
      "Não. O cadastro libera um período gratuito para testar o sistema e entender se ele faz sentido para a rotina da sua igreja.",
  },
  {
    question: "Os dados de uma igreja ficam separados das outras?",
    answer:
      "Sim. Cada igreja acessa apenas seus próprios dados. As telas administrativas e o portal dos membros respeitam o escopo da igreja autenticada.",
  },
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
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-3 shadow-md">
      <div className="flex items-center justify-between border-b border-border px-2 pb-3">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          {label}
        </p>
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
      </div>
      <div className="relative mt-3 aspect-[16/10] overflow-hidden rounded-lg border border-border bg-surface-subtle">
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

function EventsAndAutomationSection() {
  return (
    <section className="border-y border-border bg-surface/60">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-2">
          <ProductScreenshot
            src="/eventos_screenshot.png"
            alt="Tela de eventos do Gerencia Igreja com calendário mensal e escala de obreiros"
            label="Eventos e escalas"
          />
          <div className="flex flex-col justify-center">
            <SectionLabel>Escalas e eventos</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              Escale obreiros, envie pelo WhatsApp e acompanhe as respostas.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              O Gerencia Igreja tira a escala do improviso: você cria o evento,
              monta a equipe, cada obreiro recebe seu próprio link e o painel
              mostra quem aceitou, recusou ou ainda está pendente.
            </p>
            <div className="mt-8 grid gap-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex gap-3 rounded-lg border border-border bg-surface p-4"
                >
                  <Check className="mt-0.5 shrink-0 text-accent" size={18} />
                  <p className="text-sm leading-6 text-muted">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 border-t border-border pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionLabel>WhatsApp automático</SectionLabel>
            <h3 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
              O obreiro recebe a escala sem você precisar cobrar manualmente.
            </h3>

            <div className="mt-6 grid gap-4">
              {[
                {
                  title: "Convite ao escalar",
                  description:
                    "O obreiro recebe a mensagem assim que é vinculado ao evento.",
                  icon: Send,
                },
                {
                  title: "Lembrete um dia antes",
                  description:
                    "Quem ainda não respondeu recebe uma nova mensagem na véspera.",
                  icon: Clock3,
                },
                {
                  title: "Respostas centralizadas",
                  description:
                    "Aceites e recusas ficam organizados no acompanhamento da escala.",
                  icon: BellRing,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.title} className="flex gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                      <Icon size={17} />
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {item.title}
                      </h4>
                      <p className="mt-1 text-sm leading-6 text-muted">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface p-3 shadow-md">
            <Image
              src="/convite_escala_whatsapp.jpeg"
              alt="Mensagem automática de convite de escala enviada pelo WhatsApp ao obreiro"
              width={1080}
              height={1606}
              sizes="(min-width: 1024px) 380px, 90vw"
              className="h-auto w-full rounded-xl border border-border"
            />
          </div>
        </div>
      </div>
    </section>
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
            <a
              className="transition hover:text-foreground"
              href="#funcionalidades"
            >
              Funcionalidades
            </a>
            <a className="transition hover:text-foreground" href="#planos">
              Planos
            </a>
            <a className="transition hover:text-foreground" href="#faq">
              Dúvidas
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <AnalyticsLink
              href={WHATSAPP_CONTACT_URL}
              eventName="landing_whatsapp_clicked"
              eventProperties={{ location: "header" }}
              target="_blank"
              rel="noreferrer"
              className="hidden h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent hover:text-accent lg:inline-flex"
            >
              <MessageCircle size={16} />
              WhatsApp
            </AnalyticsLink>
            <Link
              href="/login"
              className="hidden h-10 cursor-pointer items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent hover:text-accent sm:inline-flex"
            >
              Entrar
            </Link>
            <AnalyticsLink
              href="/cadastro"
              eventName="landing_cta_clicked"
              eventProperties={{ location: "header", cta: "comecar" }}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-accent bg-accent px-4 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:bg-yellow-400 hover:shadow-md"
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
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-xs font-semibold text-foreground">
              <Church size={15} className="text-accent" />
              Gestão moderna para igrejas em crescimento
            </div>

            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Escalas, eventos e WhatsApp automático em um só lugar.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted sm:text-lg">
              O Gerencia Igreja ajuda sua igreja a montar escalas, avisar
              obreiros pelo WhatsApp, acompanhar respostas e manter membros,
              eventos e financeiro organizados sem depender de planilhas soltas.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <AnalyticsLink
                href="/cadastro"
                eventName="landing_cta_clicked"
                eventProperties={{ location: "hero", cta: "testar_gratis" }}
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-accent bg-accent px-6 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:bg-yellow-400 hover:shadow-md"
              >
                Começar teste grátis
                <ArrowRight size={17} />
              </AnalyticsLink>
              {/* <Link
                href="/login"
                className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg border border-border bg-surface px-6 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent hover:text-accent"
              >
                Já tenho acesso
              </Link> */}
              <AnalyticsLink
                href={WHATSAPP_CONTACT_URL}
                eventName="landing_whatsapp_clicked"
                eventProperties={{ location: "hero" }}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-surface px-6 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent hover:text-accent"
              >
                <MessageCircle size={17} />
                Falar no WhatsApp
              </AnalyticsLink>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                "Escalas enviadas pelo WhatsApp",
                "Membros, eventos e financeiro juntos",
                "Menos cobrança manual na rotina",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted"
                >
                  <BadgeCheck size={16} className="text-accent" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full border border-accent/30" />
            <ProductScreenshot
              src="/home_screenshot.png"
              alt="Tela inicial do Gerencia Igreja com resumo, agenda e calendário mensal"
              label="Painel Gerencia Igreja"
            />
          </div>
        </div>
      </section>

      <EventsAndAutomationSection />

      <section
        id="funcionalidades"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="mb-10 max-w-3xl">
          <SectionLabel>Funcionalidades</SectionLabel>
          <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
            Tudo que a administração precisa, sem tirar o foco do cuidado
            pastoral.
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group rounded-xl border border-border bg-surface p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent hover:shadow-md"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-surface-subtle text-foreground transition group-hover:bg-accent group-hover:text-accent-foreground">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="flex flex-col justify-center">
            <SectionLabel>Financeiro</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              Uma visão clara de receitas, despesas e saldo da igreja.
            </h2>
            <div className="mt-6 grid gap-3">
              {[
                "Receitas e despesas organizadas por categoria",
                "Saldo atualizado a partir das transações efetivadas",
                "Pendências visíveis para manter a rotina em dia",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-lg border border-border bg-surface p-4"
                >
                  <Check className="mt-0.5 shrink-0 text-accent" size={18} />
                  <p className="text-sm leading-6 text-muted">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <ProductScreenshot
            src="/financeiro_screenshot.png"
            alt="Tela financeira do Gerencia Igreja com saldo e transações da igreja"
            label="Financeiro da igreja"
          />
        </div>
      </section>

      {/* <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionLabel>Como funciona</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              Um fluxo simples para tirar a gestão do modo manual.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {workflow.map((step, index) => (
              <div key={step} className="rounded-lg border border-border bg-surface p-5">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
                  Passo {index + 1}
                </span>
                <p className="mt-4 text-sm leading-7 text-muted">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <section
        id="planos"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <SectionLabel>Planos</SectionLabel>
          <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
            Escolha o plano ideal para organizar sua igreja agora.
          </h2>
          <div className="mt-6 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm font-semibold text-foreground">
            Basta criar a conta e testar gratuitamente sem adicionar cartão de
            crédito.
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-5 lg:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative rounded-2xl border p-6 shadow-sm ${
                plan.highlight
                  ? "border-accent bg-primary text-primary-foreground dark:bg-surface dark:text-foreground"
                  : "border-border bg-surface text-foreground"
              }`}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <span
                    className={`inline-flex rounded-md border px-3 py-1 text-xs font-semibold ${
                      plan.highlight
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-surface-subtle text-foreground"
                    }`}
                  >
                    {plan.badge}
                  </span>
                  <h3 className="mt-5 text-2xl font-semibold">{plan.name}</h3>
                  <p
                    className={`mt-3 text-sm leading-7 ${plan.highlight ? "opacity-75" : "text-muted"}`}
                  >
                    {plan.description}
                  </p>
                </div>
              </div>

              <div className="mb-6 border-y border-current/10 py-6">
                <div className="flex items-end gap-1">
                  <span className="text-sm font-semibold">R$</span>
                  <span className="text-5xl font-semibold tracking-tight">
                    {plan.price}
                  </span>
                  <span
                    className={`pb-2 text-sm ${plan.highlight ? "opacity-70" : "text-muted"}`}
                  >
                    {plan.period}
                  </span>
                </div>
                {plan.name === "Anual" ? (
                  <p className="mt-2 text-xs opacity-70">
                    Preço de lançamento para cobrança anual.
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-muted">
                    Preço de lançamento para cobrança mensal.
                  </p>
                )}
              </div>

              <div className="grid gap-3">
                {plan.benefits.map((benefit) => (
                  <div key={benefit} className="flex gap-3 text-sm leading-6">
                    <Check className="mt-0.5 shrink-0 text-accent" size={17} />
                    <span
                      className={plan.highlight ? "opacity-85" : "text-muted"}
                    >
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>

              <AnalyticsLink
                href="/cadastro"
                eventName="landing_plan_cta_clicked"
                eventProperties={{ plan: plan.name, price: plan.price }}
                className={`mt-8 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-5 text-sm font-semibold transition-all duration-200 ${
                  plan.highlight
                    ? "border-accent bg-accent text-accent-foreground hover:bg-yellow-400"
                    : "border-border bg-surface-subtle text-foreground hover:border-accent hover:text-accent"
                }`}
              >
                Começar teste grátis
                <ArrowRight size={17} />
              </AnalyticsLink>
            </article>
          ))}
        </div>
      </section>

      <section
        id="faq"
        className="border-y border-border bg-surface/60 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionLabel>Dúvidas frequentes</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
              Perguntas comuns antes de organizar sua igreja no sistema.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              Respostas rápidas sobre escalas, membros, financeiro e o período
              gratuito para começar com tranquilidade.
            </p>
          </div>

          <div className="grid gap-3">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-border bg-surface p-5 shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold text-foreground">
                  <span>{item.question}</span>
                  <span className="mt-1 text-accent transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 border-t border-border pt-4 text-sm leading-7 text-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="grid gap-8 rounded-2xl border border-border bg-surface p-6 shadow-sm lg:grid-cols-[1fr_0.8fr] lg:p-10">
          <div>
            <SectionLabel>Próximo passo</SectionLabel>
            <h2 className="mt-3 text-3xl font-semibold text-foreground">
              Pronto para transformar a rotina administrativa da igreja?
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
              Comece com o cadastro da igreja, teste todas as funcionalidades
              gratuitamente e conte para nós o que faria mais sentido na rotina
              real da sua igreja.
            </p>
          </div>
          <div className="flex flex-col justify-center gap-3 sm:flex-row lg:flex-col">
            <AnalyticsLink
              href="/cadastro"
              eventName="landing_cta_clicked"
              eventProperties={{ location: "final", cta: "comecar_gratis" }}
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-accent bg-accent px-6 text-sm font-semibold text-accent-foreground transition-all duration-200 hover:bg-yellow-400 hover:shadow-md"
            >
              Começar teste grátis
              <ArrowRight size={17} />
            </AnalyticsLink>
            {/* <Link
              href="/login"
              className="inline-flex h-12 cursor-pointer items-center justify-center rounded-lg border border-border px-6 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent hover:text-accent"
            >
              Acessar sistema
            </Link> */}
            <AnalyticsLink
              href={WHATSAPP_CONTACT_URL}
              eventName="landing_whatsapp_clicked"
              eventProperties={{ location: "final" }}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-6 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent hover:text-accent"
            >
              <MessageCircle size={17} />
              Falar no WhatsApp
            </AnalyticsLink>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-surface/60 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.3fr_0.7fr_0.7fr_0.9fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted">
              Gestão de igrejas simples, organizada e preparada para quem vive a
              rotina ministerial.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Acessos rápidos
            </h3>
            <div className="mt-4 grid gap-3 text-sm text-muted">
              <a
                className="transition hover:text-foreground"
                href="#funcionalidades"
              >
                Funcionalidades
              </a>
              <a className="transition hover:text-foreground" href="#planos">
                Planos
              </a>
              <a className="transition hover:text-foreground" href="#faq">
                Dúvidas frequentes
              </a>
              <Link className="transition hover:text-foreground" href="/termos-de-uso">
                Termos de uso
              </Link>
              <Link
                className="transition hover:text-foreground"
                href="/politica-de-privacidade"
              >
                Política de privacidade
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Redes sociais
            </h3>
            <div className="mt-4 grid gap-3 text-sm text-muted">
              <a
                className="transition hover:text-foreground"
                href="https://instagram.com/gerenciaigreja"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-muted">
              <a
                className="transition hover:text-foreground"
                href="https://www.youtube.com/@GerenciaIgreja"
                target="_blank"
                rel="noreferrer"
              >
                Youtube
              </a>
            </div>
            <div className="mt-4 grid gap-3 text-sm text-muted">
              <a
                className="transition hover:text-foreground"
                href="https://www.facebook.com/share/1G5kuBfgDL/?mibextid=wwXIfr"
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Contato</h3>
            <div className="mt-4 grid gap-3 text-sm text-muted">
              <a
                className="break-all transition hover:text-foreground"
                href="mailto:contato@gerenciaigreja.com.br"
              >
                contato@gerenciaigreja.com.br
              </a>
              <AnalyticsLink
                href={WHATSAPP_CONTACT_URL}
                eventName="landing_whatsapp_clicked"
                eventProperties={{ location: "footer" }}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-2 transition hover:text-foreground"
              >
                <MessageCircle size={16} />
                WhatsApp
              </AnalyticsLink>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-col justify-between gap-3 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <span>Gerencia Igreja - Gestão de igrejas</span>
          <span>Feito para servir melhor, com organização e clareza.</span>
        </div>
      </footer>
    </main>
  );
}
