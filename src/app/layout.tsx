import type { Metadata } from "next";
import "./globals.css";

import { AppProviders } from "@/components/providers/app-providers";

export const metadata: Metadata = {
  title: "Gerencia Igreja — Gestão de igrejas",
  description:
    "Gerencie membros, obreiros, finanças, eventos e escalas da sua igreja em um só lugar. Simples, seguro e pronto para crescer.",
  icons: [
    {
      media: "(prefers-color-scheme: light)",
      url: "/logo_gerencia_igreja_tema_light.png",
      href: "/logo_gerencia_igreja_tema_light.png",
    },
    {
      media: "(prefers-color-scheme: dark)",
      url: "/logo_gerencia_igreja_tema_dark.png",
      href: "/logo_gerencia_igreja_tema_dark.png",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
