"use client";

import posthog from "posthog-js";
import { useEffect, useRef } from "react";

import { useAuth } from "@/features/auth/auth-provider";

export function PostHogIdentifier() {
  const { session } = useAuth();
  const identifiedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!posthog.__loaded) {
      return;
    }

    if (!session) {
      if (identifiedUserIdRef.current) {
        posthog.reset();
        identifiedUserIdRef.current = null;
      }

      return;
    }

    if (identifiedUserIdRef.current === session.user.id) {
      return;
    }

    posthog.identify(session.user.id, {
      church_id: session.church.id,
      church_name: session.church.name,
      church_slug: session.church.slug,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    });
    posthog.group("church", session.church.id, {
      name: session.church.name,
      slug: session.church.slug,
    });
    identifiedUserIdRef.current = session.user.id;
  }, [session]);

  return null;
}