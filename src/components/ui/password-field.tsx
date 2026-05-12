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
          className={`h-11 w-full rounded-lg border border-border bg-surface-subtle px-3.5 pr-11 text-sm text-foreground shadow-xs transition-all duration-200 placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 focus:outline-none ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer items-center justify-center rounded-md p-0.5 text-muted transition-colors duration-200 hover:text-foreground"
          aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
          title={isVisible ? "Ocultar senha" : "Mostrar senha"}
        >
          <Icon size={18} />
        </button>
      </div>
    </label>
  );
}
