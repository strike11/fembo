export const PAYMENT_PROVIDER_IDS = ["stripe", "ccbill", "segpay"] as const;

export type PaymentProviderId = (typeof PAYMENT_PROVIDER_IDS)[number];

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "past_due"
  | "incomplete"
  | "unknown";

export interface PaymentCustomer {
  id: string;
  providerId: PaymentProviderId;
  userId: string;
  email?: string;
}

export interface Subscription {
  id: string;
  providerId: PaymentProviderId;
  customerId: string;
  userId?: string;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
}

export interface PaymentEvent {
  id: string;
  providerId: PaymentProviderId;
  type: string;
  payload: unknown;
}

export interface WebhookVerificationResult {
  ok: true;
  event: PaymentEvent;
}

export interface WebhookVerificationError {
  ok: false;
  status: number;
  message: string;
}

export type WebhookVerification = WebhookVerificationResult | WebhookVerificationError;

export interface WebhookHandleResult {
  received: true;
  duplicate?: boolean;
}

export interface PaymentProvider {
  readonly id: PaymentProviderId;
  verifyWebhook(request: Request): Promise<WebhookVerification>;
  handleWebhookEvent(event: PaymentEvent): Promise<void>;
}

export class PaymentProviderError extends Error {
  constructor(
    message: string,
    readonly code: "not_configured" | "not_implemented",
  ) {
    super(message);
    this.name = "PaymentProviderError";
  }
}
