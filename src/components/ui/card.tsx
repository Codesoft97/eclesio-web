import type { ReactNode } from "react";

type CardVariant = "default" | "elevated" | "accent";

interface CardProps {
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<CardVariant, string> = {
  default:
    "border-border bg-surface shadow-sm",
  elevated:
    "border-border bg-surface shadow-md hover:shadow-lg transition-shadow duration-300",
  accent:
    "border-accent/20 bg-primary text-primary-foreground shadow-md dark:bg-surface dark:text-foreground dark:border-border",
};

export function Card({ variant = "default", children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl border backdrop-blur-sm ${variantStyles[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
