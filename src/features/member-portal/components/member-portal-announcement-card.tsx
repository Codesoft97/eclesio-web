"use client";

import { Eye, Heart, Loader2, Megaphone } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

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
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  onChange?: (announcement: MemberPortalAnnouncement) => void;
}

export function MemberPortalAnnouncementCard({
  announcement,
  eyebrow = "Comunicado",
  actionHref,
  actionLabel,
  className = "",
  onChange,
}: MemberPortalAnnouncementCardProps) {
  const currentAnnouncement = announcement;
  const [isLikePending, setIsLikePending] = useState(false);
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

  return (
    <article
      ref={cardRef}
      className={`rounded-lg border border-border bg-surface-subtle p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface text-foreground">
          <Megaphone size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
            <p className="font-mono text-xs uppercase text-muted">{eyebrow}</p>
            <span className="text-xs text-muted">
              {formatFullDate(currentAnnouncement.publishedAt)}
            </span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-foreground">
            {currentAnnouncement.title}
          </h3>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">
            {currentAnnouncement.content}
          </p>

          <div className="mt-4 flex flex-col justify-between gap-3 border-t border-border pt-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Eye size={15} />
                {currentAnnouncement.viewsCount} visualizacoes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Heart
                  className={
                    currentAnnouncement.likedByMe
                      ? "fill-danger text-danger"
                      : ""
                  }
                  size={15}
                />
                {currentAnnouncement.likesCount} curtidas
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {actionHref && actionLabel ? (
                <Link
                  href={actionHref}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-all duration-200 hover:border-accent hover:text-accent"
                >
                  {actionLabel}
                </Link>
              ) : null}
              <Button
                type="button"
                variant={currentAnnouncement.likedByMe ? "danger" : "outline"}
                className="h-10 px-3"
                aria-pressed={currentAnnouncement.likedByMe}
                onClick={() => void handleLikeToggle()}
                disabled={isLikePending}
              >
                {isLikePending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Heart
                    className={
                      currentAnnouncement.likedByMe
                        ? "fill-current"
                        : undefined
                    }
                    size={16}
                  />
                )}
                {currentAnnouncement.likedByMe ? "Curtido" : "Curtir"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
