import { prisma } from "@/lib/db";
import { giftById } from "@/lib/gifts";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";
import { firstZodError, giftSchema } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const gifts = await prisma.gift.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return Response.json({ gifts });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const parsed = giftSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const def = giftById(parsed.data.kind);
  if (!def) return Response.json({ error: "Unknown gift" }, { status: 400 });

  const gift = await prisma.gift.create({
    data: { userId: session.user.id, slug: parsed.data.slug, kind: parsed.data.kind },
  });
  await prisma.memory.create({
    data: { userId: session.user.id, slug: parsed.data.slug, content: def.memory },
  });
  return Response.json({ gift, thanks: def.thanks });
}
