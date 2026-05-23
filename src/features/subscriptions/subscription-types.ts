import type {
  SubscriptionAccessStatus,
  SubscriptionBillingInterval,
  SubscriptionPlanCode,
} from "@/features/auth/auth-types";

export type SubscriptionInvoiceStatus =
  | "PENDING"
  | "PAID"
  | "CANCELED"
  | "EXPIRED";

export type SubscriptionPaymentProvider = "MANUAL_PIX";

export interface SubscriptionPlanOption {
  planCode: SubscriptionPlanCode;
  billingInterval: SubscriptionBillingInterval;
  amount: string;
}

export interface SubscriptionInvoice {
  id: string;
  paymentReference: string;
  planCode: SubscriptionPlanCode;
  billingInterval: SubscriptionBillingInterval;
  status: SubscriptionInvoiceStatus;
  paymentProvider: SubscriptionPaymentProvider;
  amount: string;
  pixKey: string;
  pixCopyPaste: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
  expiresAt: string | null;
  paidAt: string | null;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionOverview {
  subscription: SubscriptionAccessStatus;
  planOptions: SubscriptionPlanOption[];
  pendingInvoice: SubscriptionInvoice | null;
}

export interface CreateSubscriptionInvoicePayload {
  planCode: SubscriptionPlanCode;
  billingInterval: SubscriptionBillingInterval;
}
