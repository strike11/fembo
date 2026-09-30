import { prisma } from "@/lib/db";
import type { PaymentProviderId } from "@/lib/payments/types";

export function webhookEventDedupeKey(providerId: PaymentProviderId, eventId: string) {
  return `${providerId}:${eventId}`;
}

export type WebhookEventStore = {
  claim(
    providerId: PaymentProviderId,
    eventId: string,
    eventType: string,
  ): Promise<{ claimed: boolean }>;
};

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export function createMemoryWebhookEventStore(): WebhookEventStore {
  const seen = new Set<string>();
  return {
    async claim(providerId, eventId) {
      const key = webhookEventDedupeKey(providerId, eventId);
      if (seen.has(key)) {
        return { claimed: false };
      }
      seen.add(key);
      return { claimed: true };
    },
  };
}

export function createPrismaWebhookEventStore(): WebhookEventStore {
  return {
    async claim(providerId, eventId, eventType) {
      try {
        await prisma.paymentWebhookEvent.create({
          data: { providerId, eventId, eventType },
        });
        return { claimed: true };
      } catch (error) {
        if (isUniqueViolation(error)) {
          return { claimed: false };
        }
        throw error;
      }
    },
  };
}

let webhookEventStore: WebhookEventStore = createPrismaWebhookEventStore();

export function setWebhookEventStore(store: WebhookEventStore) {
  webhookEventStore = store;
}

export function resetWebhookEventStore() {
  webhookEventStore = createPrismaWebhookEventStore();
}

export async function claimWebhookEvent(
  providerId: PaymentProviderId,
  eventId: string,
  eventType: string,
): Promise<{ claimed: boolean }> {
  return webhookEventStore.claim(providerId, eventId, eventType);
}
