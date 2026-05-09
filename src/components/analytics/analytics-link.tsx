"use client";

import Link, { type LinkProps } from "next/link";
import posthog from "posthog-js";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type AnalyticsLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    eventName: string;
    eventProperties?: Record<string, string | number | boolean | null>;
    children: ReactNode;
  };

export function AnalyticsLink({
  eventName,
  eventProperties,
  onClick,
  children,
  ...props
}: AnalyticsLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        if (posthog.__loaded) {
          posthog.capture(eventName, eventProperties);
        }

        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}