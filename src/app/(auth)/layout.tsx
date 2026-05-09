import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden border-r border-border px-10 py-8 lg:flex lg:flex-col lg:justify-between">
          <Logo />
          <div className="max-w-sm">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Gestão Simplificada
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-foreground">
              Cuide da sua igreja com mais clareza, ordem e propósito.
            </h1>
            <p className="mt-5 text-sm leading-6 text-muted">
              Gerencie membros, obreiros, finanças, eventos e relatórios tudo em um só lugar.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs text-muted">
            <div className="border border-border bg-surface p-3">
              Financeiro
            </div>

            <div className="border border-border bg-surface p-3">
              Obreiros
            </div>

            <div className="border border-border bg-surface p-3">
              Eventos
            </div>
          </div>
        </section>
        <section className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-12">
          <div className="mb-10 flex items-center justify-between lg:justify-end">
            <div className="lg:hidden">
              <Logo />
            </div>
            <ThemeToggle />
          </div>
          <div className="flex flex-1 items-center justify-center">{children}</div>
        </section>
      </div>
    </main>
  );
}