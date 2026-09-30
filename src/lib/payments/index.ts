import { resolvePaymentProviderId } from "@/lib/payments/env";
import { StripeProvider } from "@/lib/payments/stripe-provider";
import {
  PAYMENT_PROVIDER_IDS,
  PaymentProviderError,
  type PaymentProvider,
  type PaymentProviderId,
  type WebhookHandleResult,
} from "@/lib/payments/types";
import { claimWebhookEvent } from "@/lib/payments/webhook-store";

export { paymentProviderEnvErrors, resolvePaymentProviderId } from "@/lib/payments/env";

export {
  PAYMENT_PROVIDER_IDS,
  PaymentProviderError,
  type PaymentCustomer,
  type PaymentEvent,
  type PaymentProvider,
  type PaymentProviderId,
  type Subscription,
  type SubscriptionStatus,
  type WebhookHandleResult,
  type WebhookVerification,
} from "@/lib/payments/types";
export {
  claimWebhookEvent,
  createMemoryWebhookEventStore,
  resetWebhookEventStore,
  setWebhookEventStore,
  webhookEventDedupeKey,
} from "@/lib/payments/webhook-store";
export { StripeProvider } from "@/lib/payments/stripe-provider";

const IMPLEMENTED_PROVIDERS: PaymentProviderId[] = ["stripe"];

export function createPaymentProvider(id: PaymentProviderId): PaymentProvider {
  if (!IMPLEMENTED_PROVIDERS.includes(id)) {
    throw new PaymentProviderError(
      `Payment provider "${id}" is not implemented yet`,
      "not_implemented",
    );
  }
  if (id === "stripe") {
    return new StripeProvider();
  }
  throw new PaymentProviderError(
    `Payment provider "${id}" is not implemented yet`,
    "not_implemented",
  );
}

export function getPaymentProvider(env: NodeJS.ProcessEnv = process.env) {
  return createPaymentProvider(resolvePaymentProviderId(env));
}

export async function handlePaymentWebhook(
  request: Request,
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ response: Response; result?: WebhookHandleResult }> {
  const provider = getPaymentProvider(env);
  const verification = await provider.verifyWebhook(request);

  if (!verification.ok) {
    return {
      response: new Response(JSON.stringify({ error: verification.message }), {
        status: verification.status,
      }),
    };
  }

  const { event } = verification;
  const claim = await claimWebhookEvent(event.providerId, event.id, event.type);
  if (!claim.claimed) {
    return {
      response: Response.json({ received: true, duplicate: true }),
      result: { received: true, duplicate: true },
    };
  }

  await provider.handleWebhookEvent(event);
  return {
    response: Response.json({ received: true }),
    result: { received: true },
  };
}
