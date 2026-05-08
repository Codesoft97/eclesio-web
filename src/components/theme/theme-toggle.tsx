"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex h-10 w-10 cursor-pointer items-center justify-center border border-border bg-surface text-foreground transition hover:border-accent hover:text-accent"
      aria-label="Alternar tema"
      title="Alternar tema"
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
