"use client";

import { Eye, EyeOff } from "lucide-react";
import { InputHTMLAttributes, useState } from "react";

interface PasswordFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label: string;
}

export function PasswordField({
  label,
  className = "",
  ...props
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <label className="grid gap-2 text-sm font-medium text-foreground">
      <span>{label}</span>
      <div className="relative">
        <input
          type={isVisible ? "text" : "password"}
          className={`h-11 w-full border border-border bg-surface px-3 pr-11 text-sm text-foreground transition placeholder:text-muted focus:border-accent focus:outline-none ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center text-muted transition hover:text-foreground"
          aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
          title={isVisible ? "Ocultar senha" : "Mostrar senha"}
        >
          <Icon size={18} />
        </button>
      </div>
    </label>
  );
}
