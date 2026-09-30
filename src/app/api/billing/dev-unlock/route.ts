import { prisma } from "@/lib/db";
import { canDevUnlock } from "@/lib/plus";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return new Response(JSON.stringify({ error: "Invalid origin" }), { status: 403 });
  }
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Sign in first" }), { status: 401 });
  }
  if (!canDevUnlock()) {
    return new Response(JSON.stringify({ error: "Use Stripe checkout" }), { status: 403 });
  }

  const plusUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { plusUntil },
  });
  return Response.json({ plus: true, plusUntil: plusUntil.toISOString() });
}
