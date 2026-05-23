import { api } from "@/lib/api";

import type {
  CreateSubscriptionInvoicePayload,
  SubscriptionInvoice,
  SubscriptionOverview,
} from "./subscription-types";

export async function getMySubscription() {
  const { data } = await api.get<SubscriptionOverview>("/subscriptions/me");

  return data;
}

export async function createSubscriptionInvoice(
  payload: CreateSubscriptionInvoicePayload,
) {
  const { data } = await api.post<SubscriptionInvoice>(
    "/subscriptions/invoices",
    payload,
  );

  return data;
}

export async function upgradeTrialToComplete() {
  const { data } = await api.post<SubscriptionOverview>(
    "/subscriptions/trial/upgrade-to-complete",
  );

  return data;
}
