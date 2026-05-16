/* eslint-disable @next/next/no-img-element */
"use client";

import { Eye, Heart, Loader2, Maximize2, Megaphone, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { formatFullDate } from "../member-portal-formatters";
import {
  likeMemberPortalAnnouncement,
  registerMemberPortalAnnouncementView,
  unlikeMemberPortalAnnouncement,
} from "../member-portal-service";
import type { MemberPortalAnnouncement } from "../member-portal-types";

interface MemberPortalAnnouncementCardProps {
  announcement: MemberPortalAnnouncement;
  eyebrow?: string;
  sourceName?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  onChange?: (announcement: MemberPortalAnnouncement) => void;
}

export function MemberPortalAnnouncementCard({
  announcement,
  eyebrow = "Comunicado",
  sourceName = "Comunicado da igreja",
  actionHref,
  actionLabel,
  className = "",
  onChange,
}: MemberPortalAnnouncementCardProps) {
  const currentAnnouncement = announcement;
  const [isLikePending, setIsLikePending] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const cardRef = useRef<HTMLElement | null>(null);
  const hasRequestedViewRef = useRef(false);

  useEffect(() => {
    hasRequestedViewRef.current = false;
  }, [announcement.id]);

  useEffect(() => {
    const element = cardRef.current;

    if (!element || typeof IntersectionObserver === "undefined") {
      return;
    }

    let viewTimer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          entry.intersectionRatio >= 0.6 &&
          !hasRequestedViewRef.current
        ) {
          if (viewTimer) {
            return;
          }

          viewTimer = setTimeout(() => {
            if (hasRequestedViewRef.current) {
              return;
            }

            hasRequestedViewRef.current = true;
            void registerMemberPortalAnnouncementView(announcement.id)
              .then((updatedAnnouncement) => {
                onChange?.(updatedAnnouncement);
              })
              .catch(() => {
                hasRequestedViewRef.current = false;
              });
          }, 700);
          return;
        }

        if (viewTimer) {
          clearTimeout(viewTimer);
          viewTimer = null;
        }
      },
      {
        threshold: [0, 0.6, 1],
      },
    );

    observer.observe(element);

    return () => {
      if (viewTimer) {
        clearTimeout(viewTimer);
      }
      observer.disconnect();
    };
  }, [announcement.id, onChange]);

  useEffect(() => {
    if (!isImagePreviewOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsImagePreviewOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isImagePreviewOpen]);

  async function handleLikeToggle() {
    setIsLikePending(true);

    try {
      const updatedAnnouncement = currentAnnouncement.likedByMe
        ? await unlikeMemberPortalAnnouncement(currentAnnouncement.id)
        : await likeMemberPortalAnnouncement(currentAnnouncement.id);

      onChange?.(updatedAnnouncement);
    } catch {
      // Mantem o card responsivo mesmo se a rede falhar; o proximo refresh reconcilia.
    } finally {
      setIsLikePending(false);
    }
  }

  function formatCount(value: number, singular: string, plural: string) {
    return `${value} ${value === 1 ? singular : plural}`;
  }

  return (
    <>
      <article
        ref={cardRef}
        className={`overflow-hidden rounded-lg border border-border bg-surface shadow-sm ${className}`}
      >
        <div className="p-4 sm:p-5">
          <header className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent">
              <Megaphone size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {sourceName}
                </p>
                <span className="hidden h-1 w-1 rounded-full bg-muted sm:block" />
                <span className="text-xs text-muted">
                  {formatFullDate(currentAnnouncement.publishedAt)}
                </span>
              </div>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                {eyebrow}
              </p>
            </div>
          </header>

          <div className="mt-4">
            <h3 className="text-xl font-semibold leading-tight text-foreground">
              {currentAnnouncement.title}
            </h3>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted">
              {currentAnnouncement.content.trim() || "Sem detalhes adicionais."}
            </p>
          </div>

          {currentAnnouncement.imageUrl ? (
            <div className="mt-4 overflow-hidden rounded-lg border border-border bg-surface-subtle">
              <button
                type="button"
                onClick={() => setIsImagePreviewOpen(true)}
                className="group relative flex max-h-[420px] w-full cursor-zoom-in items-center justify-center bg-surface"
                aria-label="Visualizar imagem em tela cheia"
              >
                <img
                  src={currentAnnouncement.imageUrl}
                  alt=""
                  className="max-h-[420px] max-w-full object-contain"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface/90 text-foreground opacity-0 shadow-sm transition group-hover:opacity-100 group-focus-visible:opacity-100">
                  <Maximize2 size={17} />
                </span>
              </button>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Eye size={15} />
              {formatCount(
                currentAnnouncement.viewsCount,
                "visualização",
                "visualizações",
              )}
            </span>
            {/* <span className="inline-flex items-center gap-1.5">
              <Heart
                className={
                  currentAnnouncement.likedByMe
                    ? "fill-danger text-danger"
                    : ""
                }
                size={15}
              />
              {formatCount(
                currentAnnouncement.likesCount,
                "curtida",
                "curtidas",
              )}
            </span> */}
          </div>
        </div>

        <div
          className={`grid border-t border-border bg-surface-subtle ${
            actionHref && actionLabel ? "grid-cols-1" : "grid-cols-1"
          }`}
        >
          {/* <button
            type="button"
            className={`inline-flex h-12 items-center justify-center gap-2 text-sm font-semibold transition-colors duration-200 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60 ${
              currentAnnouncement.likedByMe ? "text-danger" : "text-foreground"
            }`}
            aria-pressed={currentAnnouncement.likedByMe}
            onClick={() => void handleLikeToggle()}
            disabled={isLikePending}
          >
            {isLikePending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Heart
                className={
                  currentAnnouncement.likedByMe ? "fill-current" : undefined
                }
                size={17}
              />
            )}
            {currentAnnouncement.likedByMe ? "Curtido" : "Curtir"}
          </button> */}
          {actionHref && actionLabel ? (
            <Link
              href={actionHref}
              className="inline-flex h-12 items-center justify-center border-l border-border text-sm font-semibold text-foreground transition-colors duration-200 hover:bg-surface hover:text-accent"
            >
              {actionLabel}
            </Link>
          ) : null}
        </div>
      </article>

      {isImagePreviewOpen && currentAnnouncement.imageUrl ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Imagem do comunicado"
          onClick={() => setIsImagePreviewOpen(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Fechar imagem"
            onClick={(event) => {
              event.stopPropagation();
              setIsImagePreviewOpen(false);
            }}
          >
            <X size={22} />
          </button>
          <img
            src={currentAnnouncement.imageUrl}
            alt=""
            className="max-h-full max-w-full object-contain"
            referrerPolicy="no-referrer"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
