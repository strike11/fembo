import { trackEvent } from "@/lib/analytics";
import { prisma } from "@/lib/db";
import { getStripe, subscriptionPeriodEnd } from "@/lib/stripe";
import type {
  PaymentEvent,
  PaymentProvider,
  Subscription,
  SubscriptionStatus,
  WebhookVerification,
} from "@/lib/payments/types";
import type Stripe from "stripe";

function stripeSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  if (
    status === "active" ||
    status === "trialing" ||
    status === "canceled" ||
    status === "past_due" ||
    status === "incomplete"
  ) {
    return status as SubscriptionStatus;
  }
  return "unknown";
}

function toSubscription(subscription: Stripe.Subscription, userId?: string): Subscription {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;
  return {
    id: subscription.id,
    providerId: "stripe",
    customerId,
    userId: userId ?? subscription.metadata?.userId,
    status: stripeSubscriptionStatus(subscription.status),
    currentPeriodEnd: subscriptionPeriodEnd(subscription),
  };
}

async function applySubscription(userId: string, subscription: Stripe.Subscription) {
  const mapped = toSubscription(subscription, userId);
  const until =
    mapped.status === "active" || mapped.status === "trialing"
      ? mapped.currentPeriodEnd
      : new Date();
  await prisma.user.update({
    where: { id: userId },
    data: {
      plusUntil: until,
      stripeCustomerId: mapped.customerId,
      stripeSubscriptionId: mapped.id,
    },
  });
}

async function userIdFromCustomer(customerId: string) {
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true },
  });
  return user?.id ?? null;
}

export class StripeProvider implements PaymentProvider {
  readonly id = "stripe" as const;

  async verifyWebhook(request: Request): Promise<WebhookVerification> {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripe || !secret) {
      return { ok: false, status: 503, message: "Webhook not configured" };
    }

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return { ok: false, status: 400, message: "Missing signature" };
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
    } catch {
      return { ok: false, status: 400, message: "Invalid signature" };
    }

    return {
      ok: true,
      event: {
        id: event.id,
        providerId: "stripe",
        type: event.type,
        payload: event,
      },
    };
  }

  async handleWebhookEvent(event: PaymentEvent) {
    const stripe = getStripe();
    if (!stripe) return;

    const stripeEvent = event.payload as Stripe.Event;

    if (stripeEvent.type === "checkout.session.completed") {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (userId && subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await applySubscription(userId, subscription);
        void trackEvent("paid", {
          userId,
          metadata: { subscriptionId, provider: "stripe" },
        });
      }
      return;
    }

    if (
      stripeEvent.type === "customer.subscription.updated" ||
      stripeEvent.type === "customer.subscription.deleted"
    ) {
      const subscription = stripeEvent.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;
      const userId =
        subscription.metadata?.userId || (await userIdFromCustomer(customerId));
      if (!userId) return;

      if (stripeEvent.type === "customer.subscription.deleted") {
        await prisma.user.update({
          where: { id: userId },
          data: { plusUntil: new Date(), stripeSubscriptionId: null },
        });
        void trackEvent("cancel", {
          userId,
          metadata: { subscriptionId: subscription.id, provider: "stripe" },
        });
      } else {
        await applySubscription(userId, subscription);
      }
    }
  }
}
