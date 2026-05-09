import posthog from "posthog-js";

function normalizePublicEnv(value: string | undefined) {
  const normalizedValue = value?.trim().replace(/^['"]|['"]$/g, "");

  return normalizedValue && normalizedValue.length > 0
    ? normalizedValue
    : undefined;
}

const posthogProjectKey = normalizePublicEnv(
  process.env.NEXT_PUBLIC_POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_TOKEN,
);
const posthogHost = normalizePublicEnv(process.env.NEXT_PUBLIC_POSTHOG_HOST)
  ?.replace(/\/+$/, "") ?? "https://us.i.posthog.com";

if (typeof window !== "undefined" && posthogProjectKey) {
  if (!posthogProjectKey.startsWith("phc_")) {
    console.warn(
      "PostHog não foi inicializado: use a Project API Key pública do projeto, que começa com phc_.",
    );
  } else {
    posthog.init(posthogProjectKey, {
      api_host: posthogHost,
      defaults: "2026-01-30",
      capture_pageview: true,
      capture_pageleave: true,
    });
  }
}
