import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export interface LegalSection {
  title: string;
  paragraphs?: string[];
  items?: string[];
}

interface LegalDocumentPageProps {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
}

export function LegalDocumentPage({
  eyebrow,
  title,
  description,
  updatedAt,
  sections,
}: LegalDocumentPageProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="cursor-pointer" aria-label="Ir para início">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/login"
              className="hidden h-10 cursor-pointer items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent hover:text-accent sm:inline-flex"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} />
          Voltar para a página inicial
        </Link>

        <section className="mt-8 border-b border-border pb-8">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted">
            {description}
          </p>
          <p className="mt-4 text-sm font-medium text-foreground">
            Última atualização: {updatedAt}
          </p>
        </section>

        <article className="mt-8 grid gap-5">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm sm:p-6"
            >
              <h2 className="text-xl font-semibold text-foreground">
                {section.title}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-4 text-sm leading-7 text-muted"
                >
                  {paragraph}
                </p>
              ))}
              {section.items ? (
                <ul className="mt-4 grid gap-3 text-sm leading-7 text-muted">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
}
