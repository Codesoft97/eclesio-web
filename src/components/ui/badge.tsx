import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "muted";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "border-accent/30 bg-accent/10 text-accent-foreground",
  success: "border-success/30 bg-success/10 text-success",
  warning: "border-accent/30 bg-accent/10 text-accent-foreground",
  danger: "border-danger/30 bg-danger/10 text-danger",
  info: "border-info/30 bg-info/10 text-info",
  muted: "border-border bg-surface-subtle text-muted",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold leading-5 ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
