import { PublicEventPageClient } from "@/features/events/components/public-event-page-client";

interface PublicEventPageProps {
  params: Promise<{
    shareToken: string;
  }>;
}

export default async function PublicEventPage({ params }: PublicEventPageProps) {
  const { shareToken } = await params;

  return <PublicEventPageClient shareToken={shareToken} />;
}