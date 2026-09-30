import { prisma } from "@/lib/db";
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
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) {
    return new Response(JSON.stringify({ error: "No billing account yet" }), { status: 400 });
  }

  const origin = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/app/plus`,
  });
  return Response.json({ url: portal.url });
}
