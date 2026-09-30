import { prisma } from "@/lib/db";
import { canDevUnlock, PLUS_PRICE_USD, stripeReady } from "@/lib/plus";
import { getQuota } from "@/lib/quota";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Sign in first" }), { status: 401 });
  }

  const [user, quota] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plusUntil: true, stripeCustomerId: true },
    }),
    getQuota(session.user.id),
  ]);

  return Response.json({
    plus: quota.plus,
    plusUntil: user?.plusUntil?.toISOString() ?? null,
    remaining: quota.remaining,
    used: quota.used,
    limit: quota.limit,
    retryAt: quota.retryAt?.toISOString() ?? null,
    price: PLUS_PRICE_USD,
    stripeReady: stripeReady(),
    canDevUnlock: canDevUnlock(),
    hasCustomer: Boolean(user?.stripeCustomerId),
  });
}
