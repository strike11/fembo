import { ensureCompanionConfig, ensureDailyLook } from "@/lib/companion-service";
import { dailyOutfit } from "@/lib/care";
import { dayKey } from "@/lib/daily";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, letterRequestSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  await ensureDailyLook(auth.session.user.id);
  const outfits = await prisma.outfitLook.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 21,
  });
  return Response.json({ outfits });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = letterRequestSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const ensured = await ensureCompanionConfig(auth.session.user.id, parsed.data.slug);
  if (!ensured) return Response.json({ error: "Companion not found" }, { status: 404 });
  const today = dayKey();
  const outfit = await prisma.outfitLook.upsert({
    where: {
      userId_slug_day: { userId: auth.session.user.id, slug: parsed.data.slug, day: today },
    },
    update: { look: dailyOutfit(parsed.data.slug, ensured.config.nickname) },
    create: {
      userId: auth.session.user.id,
      slug: parsed.data.slug,
      day: today,
      look: dailyOutfit(parsed.data.slug, ensured.config.nickname),
    },
  });
  return Response.json({ outfit });
}
