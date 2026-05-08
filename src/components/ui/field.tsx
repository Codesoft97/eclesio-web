import type { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Field({ label, className = "", ...props }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      <input
        className={`h-11 border border-border bg-surface px-3 text-sm text-foreground transition placeholder:text-muted focus:border-accent focus:outline-none ${className}`}
        {...props}
      />
    </label>
  );
}