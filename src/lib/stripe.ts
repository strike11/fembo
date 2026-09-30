import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) {
    client = new Stripe(key);
  }
  return client;
}

export function subscriptionPeriodEnd(subscription: Stripe.Subscription) {
  const raw = subscription as Stripe.Subscription & {
    current_period_end?: number;
  };
  const unix =
    typeof raw.current_period_end === "number"
      ? raw.current_period_end
      : raw.items.data[0]?.current_period_end;
  if (typeof unix === "number") {
    return new Date(unix * 1000);
  }
  return new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);
}
