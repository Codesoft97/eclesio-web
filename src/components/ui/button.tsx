import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const variants = {
  primary: "border-accent bg-accent text-accent-foreground hover:bg-yellow-400",
  secondary: "border-primary bg-primary text-primary-foreground hover:opacity-90",
  ghost: "border-border bg-transparent text-foreground hover:border-accent hover:text-accent",
  danger: "border-danger bg-danger text-white hover:opacity-90",
};

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-11 cursor-pointer items-center justify-center gap-2 border px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
