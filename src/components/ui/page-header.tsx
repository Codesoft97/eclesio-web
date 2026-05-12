import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 xl:flex-row xl:items-end">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
