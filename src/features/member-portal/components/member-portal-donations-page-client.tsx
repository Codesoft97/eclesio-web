"use client";

import { HeartHandshake, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useAuth } from "@/features/auth/auth-provider";
import { DonationPixPanel } from "@/features/donations/components/donation-pix-panel";
import { listMemberPortalDonations } from "@/features/donations/donation-service";
import type { DonationCampaign } from "@/features/donations/donation-types";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";
import {
  DEFAULT_PAGE_SIZE,
  getEmptyPaginationMeta,
  type PaginationMeta,
} from "@/lib/pagination";

export function MemberPortalDonationsPageClient() {
  const router = useRouter();
  const { clearSession } = useAuth();
  const [donations, setDonations] = useState<DonationCampaign[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(() =>
    getEmptyPaginationMeta(DEFAULT_PAGE_SIZE),
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadDonations() {
      setIsLoading(true);
      setError(null);

      try {
        const data = await listMemberPortalDonations({
          page: currentPage,
          limit: DEFAULT_PAGE_SIZE,
        });

        if (!ignore) {
          setDonations(data.items);
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

    void loadDonations();

    return () => {
      ignore = true;
    };
  }, [clearSession, currentPage, reloadKey, router]);

  function refreshDonations() {
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
            Doações
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Escolha uma doação, escaneie o QR Code ou copie o Pix.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={refreshDonations}
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
          <Button type="button" variant="ghost" onClick={refreshDonations}>
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
            Carregando doações...
          </div>
        </div>
      ) : donations.length === 0 ? (
        <div className="grid min-h-80 place-items-center rounded-xl border border-border bg-surface p-8 text-center shadow-sm">
          <div className="max-w-sm">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-surface-subtle text-foreground">
              <HeartHandshake size={24} />
            </span>
            <h2 className="text-lg font-semibold text-foreground">
              Nenhuma opção ativa
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Quando a igreja publicar um objetivo de doação, ele aparecerá
              aqui.
            </p>
          </div>
        </div>
      ) : (
        <section className="grid gap-5">
          {donations.map((donation) => (
            <article
              key={donation.id}
              className="rounded-xl border border-border bg-surface p-5 shadow-sm"
            >
              <div className="mb-5 flex items-start gap-3 border-b border-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
                  <HeartHandshake size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {donation.title}
                  </h2>
                  {donation.description ? (
                    <p className="mt-1 text-sm leading-6 text-muted">
                      {donation.description}
                    </p>
                  ) : null}
                </div>
              </div>
              <DonationPixPanel campaign={donation} />
            </article>
          ))}
          <PaginationControls
            meta={pagination}
            isLoading={isLoading}
            onPageChange={setCurrentPage}
          />
        </section>
      )}
    </div>
  );
}
