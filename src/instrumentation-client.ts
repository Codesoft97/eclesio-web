import posthog from "posthog-js";
import type { BeforeSendFn, Properties } from "posthog-js";

const SENSITIVE_PROPERTY_KEYS = new Set([
  "email",
  "name",
  "nome",
  "church_name",
  "church_slug",
  "whatsapp",
  "phone",
  "telefone",
  "password",
  "senha",
  "password_confirmation",
  "code",
  "codigo",
  "resetToken",
  "reset_token",
]);

const MASKED_VALUE = "[masked]";

function normalizePublicEnv(value: string | undefined) {
  const normalizedValue = value?.trim().replace(/^['"]|['"]$/g, "");

  return normalizedValue && normalizedValue.length > 0
    ? normalizedValue
    : undefined;
}

function maskSensitiveProperties(properties: Properties): Properties {
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [
      key,
      SENSITIVE_PROPERTY_KEYS.has(key.toLowerCase()) ? MASKED_VALUE : value,
    ]),
  );
}

const sanitizePostHogEvent: BeforeSendFn = (event) => {
  if (!event) {
    return event;
  }

  return {
    ...event,
    properties: maskSensitiveProperties(event.properties),
    ...(event.$set ? { $set: maskSensitiveProperties(event.$set) } : {}),
    ...(event.$set_once
      ? { $set_once: maskSensitiveProperties(event.$set_once) }
      : {}),
  };
};

const posthogProjectKey = normalizePublicEnv(
  process.env.NEXT_PUBLIC_POSTHOG_KEY ?? process.env.NEXT_PUBLIC_POSTHOG_TOKEN,
);
const posthogHost =
  normalizePublicEnv(process.env.NEXT_PUBLIC_POSTHOG_HOST)?.replace(
    /\/+$/,
    "",
  ) ?? "https://us.i.posthog.com";

if (typeof window !== "undefined" && posthogProjectKey) {
  if (!posthogProjectKey.startsWith("phc_")) {
    console.warn(
      "PostHog nao foi inicializado: use a Project API Key publica do projeto, que comeca com phc_.",
    );
  } else {
    posthog.init(posthogProjectKey, {
      api_host: posthogHost,
      defaults: "2026-01-30",
      capture_pageview: true,
      capture_pageleave: true,
      mask_all_text: true,
      mask_all_element_attributes: true,
      mask_personal_data_properties: true,
      autocapture: {
        capture_copied_text: false,
      },
      session_recording: {
        maskAllInputs: true,
        maskTextSelector:
          "[data-ph-mask], [data-sensitive], [data-private], .ph-mask",
        blockSelector:
          "[data-ph-block], [data-sensitive-block], [data-private-block], .ph-block, .ph-no-capture",
      },
      before_send: sanitizePostHogEvent,
    });
  }
}
