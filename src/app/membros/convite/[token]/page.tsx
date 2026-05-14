import { MemberInvitationPageClient } from "@/features/member-access/components/member-invitation-page-client";

interface MemberInvitationPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function MemberInvitationPage({
  params,
}: MemberInvitationPageProps) {
  const { token } = await params;

  return <MemberInvitationPageClient token={token} />;
}
