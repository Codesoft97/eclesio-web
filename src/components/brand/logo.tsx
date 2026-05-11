"use client";

import Image from "next/image";

import { useTheme } from "@/components/theme/theme-provider";

export function LogoMark() {
  const { theme } = useTheme();
  const logoSrc =
    theme === "dark"
      ? "/logo_gerencia_igreja_tema_dark.png"
      : "/logo_gerencia_igreja_tema_light.png";

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden">
      <Image
        src={logoSrc}
        alt="Logo Gerencia Igreja"
        width={512}
        height={512}
        sizes="160px"
        className="h-16 w-16 object-contain"
        priority
      />
    </div>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <LogoMark />
      <div className="leading-tight">
        <p className="text-sm font-bold text-foreground">Gerencia Igreja</p>
        <p className="text-xs text-muted">Gestão de igrejas</p>
      </div>
    </div>
  );
}
