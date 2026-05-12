import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
}

const variants = {
  primary:
    "border-accent bg-accent text-accent-foreground shadow-sm hover:bg-yellow-400 hover:shadow-md active:scale-[0.98]",
  secondary:
    "border-primary bg-primary text-primary-foreground shadow-sm hover:opacity-90 active:scale-[0.98]",
  ghost:
    "border-transparent bg-transparent text-foreground hover:bg-surface-subtle hover:text-accent",
  danger:
    "border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 active:scale-[0.98]",
  outline:
    "border-border bg-transparent text-foreground hover:border-accent hover:text-accent",
};

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
