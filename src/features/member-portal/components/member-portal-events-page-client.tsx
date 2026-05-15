"use client";

import { CalendarDays, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAuth } from "@/features/auth/auth-provider";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";
import {
  DEFAULT_PAGE_SIZE,
  getEmptyPaginationMeta,
  type PaginationMeta,
} from "@/lib/pagination";

import {
  addDays,
  formatEventDate,
  sortEvents,
} from "../member-portal-formatters";
import { listMemberPortalEvents } from "../member-portal-service";
import type { MemberPortalEvent } from "../member-portal-types";

function getPortalRange() {
  const now = new Date();
  return {
    from: now.toISOString(),
    to: addDays(now, 90).toISOString(),
  };
}

export function MemberPortalEventsPageClient() {
  const router = useRouter();
  const { clearSession } = useAuth();
  const [events, setEvents] = useState<MemberPortalEvent[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(() =>
    getEmptyPaginationMeta(DEFAULT_PAGE_SIZE),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadEvents() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await listMemberPortalEvents({
          ...getPortalRange(),
          page: currentPage,
          limit: DEFAULT_PAGE_SIZE,
        });

        if (!ignore) {
          setEvents(data.items);
          setPagination(data.meta);
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

    void loadEvents();

    return () => {
      ignore = true;
    };
  }, [clearSession, currentPage, reloadKey, router]);

  const sortedEvents = useMemo(() => sortEvents(events), [events]);

  function refreshEvents() {
    setReloadKey((current) => current + 1);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Portal da igreja
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Eventos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Agenda dos proximos cultos e eventos da igreja.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={refreshEvents}
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
          <Button type="button" variant="ghost" onClick={refreshEvents}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
              <CalendarDays size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Proximos eventos
              </h2>
              <p className="text-sm leading-6 text-muted">
                Eventos cadastrados para os proximos 90 dias.
              </p>
            </div>
          </div>
          <span className="rounded-md border border-border bg-surface-subtle px-2 py-1 text-xs font-semibold text-muted">
            {pagination.totalItems}
          </span>
        </div>

        {isLoading ? (
          <div className="grid min-h-64 place-items-center text-sm text-muted">
            <div>
              <Loader2
                className="mx-auto mb-3 animate-spin text-accent"
                size={24}
              />
              Carregando eventos...
            </div>
          </div>
        ) : sortedEvents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-subtle p-6 text-center text-sm text-muted">
            Nenhum evento previsto para os proximos dias.
          </div>
        ) : (
          <div className="grid gap-3">
            {sortedEvents.map((event) => (
              <article
                key={event.id}
                className="rounded-lg border border-border bg-surface-subtle p-4"
              >
                <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                  {formatEventDate(event.startsAt)}
                </p>
                <div className="mt-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <h3 className="font-semibold text-foreground">
                    {event.title}
                  </h3>
                  {event.isRecurring ? (
                    <span className="w-fit rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-xs font-semibold text-foreground">
                      Recorrente
                    </span>
                  ) : null}
                </div>
                {event.description ? (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {event.description}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
        <PaginationControls
          meta={pagination}
          isLoading={isLoading}
          onPageChange={setCurrentPage}
        />
      </section>
    </div>
  );
}
