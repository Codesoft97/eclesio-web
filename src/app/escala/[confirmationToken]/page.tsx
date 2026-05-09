import { PublicScheduleConfirmationPageClient } from "@/features/events/components/public-schedule-confirmation-page-client";

interface PublicScheduleConfirmationPageProps {
  params: Promise<{
    confirmationToken: string;
  }>;
}

export default async function PublicScheduleConfirmationPage({
  params,
}: PublicScheduleConfirmationPageProps) {
  const { confirmationToken } = await params;

  return (
    <PublicScheduleConfirmationPageClient confirmationToken={confirmationToken} />
  );
}