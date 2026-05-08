import { AppShell } from "@/components/app-shell/app-shell";

export default function InternalAppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
