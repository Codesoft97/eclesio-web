import { MemberPortalShell } from "@/features/member-portal/components/member-portal-shell";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <MemberPortalShell>{children}</MemberPortalShell>;
}
