import { trackEvent } from "@/lib/analytics";
import { prisma } from "@/lib/db";
import { PLUS_PRICE_CENTS } from "@/lib/plus";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return new Response(JSON.stringify({ error: "Invalid origin" }), { status: 403 });
  }
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Sign in first" }), { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return new Response(JSON.stringify({ error: "Stripe is not configured" }), { status: 503 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, stripeCustomerId: true },
  });
  if (!user) {
    return new Response(JSON.stringify({ error: "Account missing" }), { status: 404 });
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const origin = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    success_url: `${origin}/app/plus?ok=1`,
    cancel_url: `${origin}/app/plus`,
    metadata: { userId: session.user.id },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: PLUS_PRICE_CENTS,
          recurring: { interval: "month" },
          product_data: {
            name: "Fembo Plus",
            description: "Your own femboy, full emotion pack, unlimited chat",
          },
        },
      },
    ],
  });

  if (!checkout.url) {
    return new Response(JSON.stringify({ error: "Could not start checkout" }), { status: 500 });
  }
  void trackEvent("checkout_start", {
    userId: session.user.id,
    metadata: { sessionId: checkout.id },
  });
  return Response.json({ url: checkout.url });
}
