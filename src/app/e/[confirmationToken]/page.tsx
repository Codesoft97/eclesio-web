import { PublicScheduleConfirmationPageClient } from "@/features/events/components/public-schedule-confirmation-page-client";

interface ShortScheduleConfirmationPageProps {
  params: Promise<{
    confirmationToken: string;
  }>;
}

export default async function ShortScheduleConfirmationPage({
  params,
}: ShortScheduleConfirmationPageProps) {
  const { confirmationToken } = await params;

  return (
    <PublicScheduleConfirmationPageClient confirmationToken={confirmationToken} />
  );
}
