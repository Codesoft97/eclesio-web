"use client";

import {
  CalendarDays,
  Loader2,
  Megaphone,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";
import { MAX_PAGE_SIZE } from "@/lib/pagination";

import {
  addDays,
  formatEventDate,
  formatFullDate,
  sortEvents,
} from "../member-portal-formatters";
import {
  getMemberPortalProfile,
  listMemberPortalAnnouncements,
  listMemberPortalEvents,
} from "../member-portal-service";
import type {
  MemberPortalAnnouncement,
  MemberPortalEvent,
  MemberPortalProfile,
} from "../member-portal-types";

function getPortalRange() {
  const now = new Date();
  return {
    from: now.toISOString(),
    to: addDays(now, 90).toISOString(),
  };
}

export function MemberPortalPageClient() {
  const router = useRouter();
  const { session, clearSession } = useAuth();
  const [profile, setProfile] = useState<MemberPortalProfile | null>(null);
  const [events, setEvents] = useState<MemberPortalEvent[]>([]);
  const [announcements, setAnnouncements] = useState<
    MemberPortalAnnouncement[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setIsLoading(true);
      setError(null);

      try {
        const [profileData, eventsData, announcementsData] = await Promise.all([
          getMemberPortalProfile(),
          listMemberPortalEvents({ ...getPortalRange(), limit: MAX_PAGE_SIZE }),
          listMemberPortalAnnouncements({ limit: 1 }),
        ]);

        if (!ignore) {
          setProfile(profileData);
          setEvents(eventsData.items);
          setAnnouncements(announcementsData.items);
        }
      } catch (err) {
        if (isUnauthorizedApiError(err)) {
          clearSession();
          router.push("/login");
          return;
        }

        if (!ignore) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      ignore = true;
    };
  }, [clearSession, reloadKey, router]);

  const sortedEvents = useMemo(() => sortEvents(events), [events]);
  const nextEvent = sortedEvents[0];
  const latestAnnouncement = announcements[0];

  function refreshDashboard() {
    setReloadKey((current) => current + 1);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Portal da igreja
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Ola, {profile?.member.name ?? session?.user.name ?? "membro"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Veja rapidamente o que esta chegando na agenda da igreja e o ultimo
            comunicado publicado.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={refreshDashboard}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <RefreshCw size={16} />
          )}
          Atualizar
        </Button>
      </div>

      {error ? (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <Button type="button" variant="ghost" onClick={refreshDashboard}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid min-h-80 place-items-center rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted shadow-sm">
          <div>
            <Loader2
              className="mx-auto mb-3 animate-spin text-accent"
              size={28}
            />
            Carregando portal...
          </div>
        </div>
      ) : (
        <section className="grid gap-4">
          {nextEvent ? (
            <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
                  <CalendarDays size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                    Proximo evento
                  </p>
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                    {formatEventDate(nextEvent.startsAt)}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">
                    {nextEvent.title}
                  </h3>
                  {nextEvent.description ? (
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {nextEvent.description}
                    </p>
                  ) : null}
                  <Link
                    href="/portal/eventos"
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent hover:text-accent"
                  >
                    Ver agenda
                  </Link>
                </div>
              </div>
            </article>
          ) : (
            <article className="rounded-xl border border-dashed border-border bg-surface p-5 text-sm text-muted shadow-sm">
              Nenhum evento previsto para os proximos dias.
            </article>
          )}

          {latestAnnouncement ? (
            <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
                  <Megaphone size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                    <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                      Ultimo comunicado
                    </p>
                    <span className="text-xs text-muted">
                      {formatFullDate(latestAnnouncement.publishedAt)}
                    </span>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">
                    {latestAnnouncement.title}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">
                    {latestAnnouncement.content}
                  </p>
                  <Link
                    href="/portal/comunicados"
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent hover:text-accent"
                  >
                    Ver comunicados
                  </Link>
                </div>
              </div>
            </article>
          ) : null}
        </section>
      )}
    </div>
  );
}
