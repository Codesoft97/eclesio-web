"use client";

import { Loader2, Megaphone, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/auth-provider";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";

import { formatFullDate } from "../member-portal-formatters";
import { listMemberPortalAnnouncements } from "../member-portal-service";
import type { MemberPortalAnnouncement } from "../member-portal-types";

export function MemberPortalAnnouncementsPageClient() {
  const router = useRouter();
  const { clearSession } = useAuth();
  const [announcements, setAnnouncements] = useState<
    MemberPortalAnnouncement[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadAnnouncements() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await listMemberPortalAnnouncements();

        if (!ignore) {
          setAnnouncements(data);
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

    void loadAnnouncements();

    return () => {
      ignore = true;
    };
  }, [clearSession, reloadKey, router]);

  function refreshAnnouncements() {
    setReloadKey((current) => current + 1);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Portal da igreja
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Comunicados
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Avisos publicados pela igreja para os membros.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={refreshAnnouncements}
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
          <Button type="button" variant="ghost" onClick={refreshAnnouncements}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      <section className="rounded-xl border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
              <Megaphone size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Lista de comunicados
              </h2>
              <p className="text-sm leading-6 text-muted">
                Somente comunicados publicados aparecem aqui.
              </p>
            </div>
          </div>
          <span className="rounded-md border border-border bg-surface-subtle px-2 py-1 text-xs font-semibold text-muted">
            {announcements.length}
          </span>
        </div>

        {isLoading ? (
          <div className="grid min-h-64 place-items-center text-sm text-muted">
            <div>
              <Loader2
                className="mx-auto mb-3 animate-spin text-accent"
                size={24}
              />
              Carregando comunicados...
            </div>
          </div>
        ) : announcements.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-surface-subtle p-6 text-center text-sm text-muted">
            Nenhum comunicado publicado no momento.
          </div>
        ) : (
          <div className="grid gap-3">
            {announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-lg border border-border bg-surface-subtle p-4"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                  <h3 className="font-semibold text-foreground">
                    {announcement.title}
                  </h3>
                  <span className="text-xs text-muted">
                    {formatFullDate(announcement.publishedAt)}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted">
                  {announcement.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
