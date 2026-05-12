import type { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Field({ label, className = "", ...props }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      <input
        className={`h-11 rounded-lg border border-border bg-surface-subtle px-3.5 text-sm text-foreground shadow-xs transition-all duration-200 placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none ${className}`}
        {...props}
      />
    </label>
  );
}