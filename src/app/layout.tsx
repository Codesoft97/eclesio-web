import type { Metadata } from "next";
import "./globals.css";

import { AppProviders } from "@/components/providers/app-providers";

export const metadata: Metadata = {
  title: "Eclesio",
  description: "Gestao simples e segura para igrejas.",
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