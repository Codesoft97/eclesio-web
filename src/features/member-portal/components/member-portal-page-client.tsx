"use client";

import {
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  HeartHandshake,
  Loader2,
  Megaphone,
  RefreshCw,
  Save,
  UserRound,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useAuth } from "@/features/auth/auth-provider";
import { DonationPixPanel } from "@/features/donations/components/donation-pix-panel";
import { listMemberPortalDonations } from "@/features/donations/donation-service";
import type { DonationCampaign } from "@/features/donations/donation-types";
import { getApiErrorMessage, isUnauthorizedApiError } from "@/lib/api";
import {
  formatBrazilianPhone,
  getPhoneDigits,
} from "@/lib/formatters/phone";

import {
  acceptMyScheduleAssignment,
  declineMyScheduleAssignment,
  getMemberPortalProfile,
  listMemberPortalAnnouncements,
  listMemberPortalEvents,
  listMyScheduleAssignments,
  updateMemberPortalProfile,
} from "../member-portal-service";
import type {
  MemberPortalAnnouncement,
  MemberPortalEvent,
  MemberPortalProfile,
  MemberPortalScheduleAssignment,
  MemberPortalScheduleStatus,
} from "../member-portal-types";

const statusDetails: Record<
  MemberPortalScheduleStatus,
  {
    label: string;
    icon: typeof CircleDashed;
    className: string;
  }
> = {
  PENDING: {
    label: "Pendente",
    icon: CircleDashed,
    className: "border-accent/40 bg-accent/10 text-foreground",
  },
  ACCEPTED: {
    label: "Aceitou",
    icon: CheckCircle2,
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  DECLINED: {
    label: "Recusou",
    icon: XCircle,
    className: "border-danger/30 bg-danger/10 text-danger",
  },
};

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function sortByEventDate<T extends { event: MemberPortalEvent }>(items: T[]) {
  return [...items].sort(
    (firstItem, secondItem) =>
      new Date(firstItem.event.startsAt).getTime() -
      new Date(secondItem.event.startsAt).getTime(),
  );
}

function sortEvents(events: MemberPortalEvent[]) {
  return [...events].sort(
    (firstEvent, secondEvent) =>
      new Date(firstEvent.startsAt).getTime() -
      new Date(secondEvent.startsAt).getTime(),
  );
}

export function MemberPortalPageClient() {
  const router = useRouter();
  const { session, setSession, clearSession } = useAuth();
  const [profile, setProfile] = useState<MemberPortalProfile | null>(null);
  const [events, setEvents] = useState<MemberPortalEvent[]>([]);
  const [schedules, setSchedules] = useState<MemberPortalScheduleAssignment[]>(
    [],
  );
  const [announcements, setAnnouncements] = useState<
    MemberPortalAnnouncement[]
  >([]);
  const [donations, setDonations] = useState<DonationCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });
  const [isSavingProfile, startSavingProfile] = useTransition();
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadPortal() {
      setIsLoading(true);
      setError(null);

      const now = new Date();
      const to = addDays(now, 90);

      try {
        const [
          profileData,
          eventsData,
          schedulesData,
          announcementsData,
          donationsData,
        ] = await Promise.all([
          getMemberPortalProfile(),
          listMemberPortalEvents({
            from: now.toISOString(),
            to: to.toISOString(),
          }),
          listMyScheduleAssignments(),
          listMemberPortalAnnouncements(),
          listMemberPortalDonations(),
        ]);

        if (!ignore) {
          setProfile(profileData);
          setEvents(eventsData);
          setSchedules(schedulesData);
          setAnnouncements(announcementsData);
          setDonations(donationsData);
          setProfileForm({
            name: profileData.member.name,
            email: profileData.member.email ?? session?.user.email ?? "",
            whatsapp: formatBrazilianPhone(profileData.member.whatsapp),
          });
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

    void loadPortal();

    return () => {
      ignore = true;
    };
  }, [clearSession, reloadKey, router, session?.user.email]);

  const sortedEvents = useMemo(() => sortEvents(events), [events]);
  const sortedSchedules = useMemo(() => sortByEventDate(schedules), [schedules]);
  const pendingSchedulesCount = useMemo(
    () =>
      schedules.filter((schedule) => schedule.confirmationStatus === "PENDING")
        .length,
    [schedules],
  );

  function refreshPortal() {
    setReloadKey((current) => current + 1);
  }

  function updateProfileField(field: keyof typeof profileForm, value: string) {
    setProfileForm((current) => ({ ...current, [field]: value }));
  }

  async function handleUnauthorized(err: unknown) {
    if (!isUnauthorizedApiError(err)) {
      return false;
    }

    clearSession();
    router.push("/login");
    return true;
  }

  function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    const payload = {
      name: profileForm.name.trim().replace(/\s+/g, " "),
      email: profileForm.email.trim().toLowerCase(),
      whatsapp: getPhoneDigits(profileForm.whatsapp),
    };

    if (payload.name.length < 2) {
      setProfileError("Informe um nome com pelo menos 2 caracteres.");
      return;
    }

    if (!payload.email.includes("@")) {
      setProfileError("Informe um email valido.");
      return;
    }

    if (payload.whatsapp.length < 10) {
      setProfileError("Informe um WhatsApp valido.");
      return;
    }

    startSavingProfile(async () => {
      try {
        const updatedProfile = await updateMemberPortalProfile(payload);
        setProfile(updatedProfile);
        setProfileForm({
          name: updatedProfile.member.name,
          email: updatedProfile.member.email ?? payload.email,
          whatsapp: formatBrazilianPhone(updatedProfile.member.whatsapp),
        });

        if (session) {
          setSession({
            ...session,
            user: {
              ...session.user,
              name: updatedProfile.member.name,
              email: updatedProfile.member.email ?? session.user.email,
              whatsapp: updatedProfile.member.whatsapp,
            },
          });
        }

        setProfileSuccess("Dados atualizados.");
      } catch (err) {
        if (await handleUnauthorized(err)) {
          return;
        }

        setProfileError(getApiErrorMessage(err));
      }
    });
  }

  async function handleScheduleResponse(
    assignment: MemberPortalScheduleAssignment,
    action: "accept" | "decline",
  ) {
    setRespondingId(assignment.id);
    setError(null);

    try {
      const updated =
        action === "accept"
          ? await acceptMyScheduleAssignment(assignment.id)
          : await declineMyScheduleAssignment(assignment.id);

      setSchedules((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      if (await handleUnauthorized(err)) {
        return;
      }

      setError(getApiErrorMessage(err));
    } finally {
      setRespondingId(null);
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Portal da igreja
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            Ola, {profile?.member.name ?? session?.user.name ?? "membro"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Acompanhe comunicados, proximos eventos e suas escalas sem precisar
            acessar as rotinas administrativas da igreja.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={refreshPortal}
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
          <Button type="button" variant="ghost" onClick={refreshPortal}>
            <RefreshCw size={16} />
            Tentar novamente
          </Button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid min-h-96 place-items-center rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted shadow-sm">
          <div>
            <Loader2 className="mx-auto mb-3 animate-spin text-accent" size={28} />
            Carregando portal...
          </div>
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="grid gap-5">
            <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="mb-5 flex items-start gap-3 border-b border-border pb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
                  <UserRound size={18} />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Meu perfil
                  </h2>
                  <p className="text-sm leading-6 text-muted">
                    Seus dados podem ser atualizados por aqui.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="grid gap-4">
                <Field
                  label="Nome"
                  value={profileForm.name}
                  onChange={(event) =>
                    updateProfileField("name", event.target.value)
                  }
                  autoComplete="name"
                  required
                />
                <Field
                  label="Email"
                  type="email"
                  value={profileForm.email}
                  onChange={(event) =>
                    updateProfileField("email", event.target.value)
                  }
                  autoComplete="email"
                  required
                />
                <Field
                  label="WhatsApp"
                  value={profileForm.whatsapp}
                  onChange={(event) =>
                    updateProfileField(
                      "whatsapp",
                      formatBrazilianPhone(event.target.value),
                    )
                  }
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={15}
                  required
                />

                {profile?.worker ? (
                  <div className="rounded-lg border border-border bg-surface-subtle p-3 text-sm">
                    <p className="font-semibold text-foreground">
                      {profile.worker.ministry.name}
                    </p>
                    <p className="mt-1 text-muted">
                      Funcao: {profile.worker.role.name}
                    </p>
                  </div>
                ) : null}

                {profileError || profileSuccess ? (
                  <p
                    className={`rounded-lg border p-3 text-sm ${
                      profileError
                        ? "border-danger/30 bg-danger/10 text-danger"
                        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    }`}
                  >
                    {profileError ?? profileSuccess}
                  </p>
                ) : null}

                <Button type="submit" disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <Loader2 className="animate-spin" size={17} />
                  ) : (
                    <Save size={17} />
                  )}
                  {isSavingProfile ? "Salvando..." : "Salvar dados"}
                </Button>
              </form>
            </article>

            <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
                    <HeartHandshake size={18} />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Doacoes
                    </h2>
                    <p className="text-sm leading-6 text-muted">
                      Escolha um objetivo e use o Pix para contribuir.
                    </p>
                  </div>
                </div>
                <span className="rounded-md border border-border bg-surface-subtle px-2 py-1 text-xs font-semibold text-muted">
                  {donations.length}
                </span>
              </div>

              {donations.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-surface-subtle p-5 text-center text-sm text-muted">
                  Nenhuma opcao de doacao ativa no momento.
                </div>
              ) : (
                <div className="grid gap-4">
                  {donations.map((donation) => (
                    <article
                      key={donation.id}
                      className="rounded-lg border border-border bg-surface-subtle p-4"
                    >
                      <div className="mb-4">
                        <h3 className="font-semibold text-foreground">
                          {donation.title}
                        </h3>
                        {donation.description ? (
                          <p className="mt-2 text-sm leading-6 text-muted">
                            {donation.description}
                          </p>
                        ) : null}
                      </div>
                      <DonationPixPanel campaign={donation} compact />
                    </article>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
                    <Megaphone size={18} />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Comunicados
                    </h2>
                    <p className="text-sm leading-6 text-muted">
                      Avisos publicados pela igreja.
                    </p>
                  </div>
                </div>
                <span className="rounded-md border border-border bg-surface-subtle px-2 py-1 text-xs font-semibold text-muted">
                  {announcements.length}
                </span>
              </div>

              {announcements.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-surface-subtle p-5 text-center text-sm text-muted">
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
            </article>
          </section>

          <section className="grid gap-5">
            <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-subtle text-foreground">
                    <CheckCircle2 size={18} />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Minhas escalas
                    </h2>
                    <p className="text-sm leading-6 text-muted">
                      Confirme sua participacao quando estiver escalado.
                    </p>
                  </div>
                </div>
                <span className="rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-xs font-semibold text-foreground">
                  {pendingSchedulesCount} pendente(s)
                </span>
              </div>

              {sortedSchedules.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-surface-subtle p-5 text-center text-sm text-muted">
                  Nenhuma escala vinculada ao seu acesso.
                </div>
              ) : (
                <div className="grid gap-3">
                  {sortedSchedules.map((assignment) => {
                    const status = statusDetails[assignment.confirmationStatus];
                    const StatusIcon = status.icon;
                    const isResponding = respondingId === assignment.id;

                    return (
                      <article
                        key={assignment.id}
                        className="rounded-lg border border-border bg-surface-subtle p-4"
                      >
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                          <div>
                            <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                              {formatEventDate(assignment.event.startsAt)}
                            </p>
                            <h3 className="mt-2 font-semibold text-foreground">
                              {assignment.event.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted">
                              {assignment.ministry.name} / {assignment.role.name}
                            </p>
                          </div>
                          <span
                            className={`inline-flex w-fit items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold ${status.className}`}
                          >
                            <StatusIcon size={13} />
                            {status.label}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {assignment.confirmationStatus !== "ACCEPTED" ? (
                            <Button
                              type="button"
                              onClick={() =>
                                void handleScheduleResponse(
                                  assignment,
                                  "accept",
                                )
                              }
                              disabled={isResponding}
                            >
                              {isResponding ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : (
                                <CheckCircle2 size={16} />
                              )}
                              Aceitar
                            </Button>
                          ) : null}
                          {assignment.confirmationStatus !== "DECLINED" ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                void handleScheduleResponse(
                                  assignment,
                                  "decline",
                                )
                              }
                              disabled={isResponding}
                            >
                              {isResponding ? (
                                <Loader2 className="animate-spin" size={16} />
                              ) : (
                                <XCircle size={16} />
                              )}
                              Recusar
                            </Button>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </article>

            <article className="rounded-xl border border-border bg-surface p-5 shadow-sm">
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
                      Agenda dos proximos 90 dias.
                    </p>
                  </div>
                </div>
                <span className="rounded-md border border-border bg-surface-subtle px-2 py-1 text-xs font-semibold text-muted">
                  {sortedEvents.length}
                </span>
              </div>

              {sortedEvents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-surface-subtle p-5 text-center text-sm text-muted">
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
                      <h3 className="mt-2 font-semibold text-foreground">
                        {event.title}
                      </h3>
                      {event.description ? (
                        <p className="mt-2 text-sm leading-6 text-muted">
                          {event.description}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </article>
          </section>
        </div>
      )}
    </div>
  );
}
