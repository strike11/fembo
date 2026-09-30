import { prisma } from "@/lib/db";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";
import { firstZodError, slugSchema } from "@/lib/validation";
import { z } from "zod";

const schema = z.object({ slug: slugSchema });

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { slug: true },
  });
  return Response.json({ slugs: favorites.map((item) => item.slug) });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_slug: { userId: session.user.id, slug: parsed.data.slug } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return Response.json({ favored: false });
  }
  await prisma.favorite.create({
    data: { userId: session.user.id, slug: parsed.data.slug },
  });
  return Response.json({ favored: true });
}
