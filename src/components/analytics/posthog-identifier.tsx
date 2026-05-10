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
      role: session.user.role,
    });
    posthog.group("church", session.church.id, {
      has_authenticated_users: true,
    });
    identifiedUserIdRef.current = session.user.id;
  }, [session]);

  return null;
}