import { ensureCompanionConfig, ensureDailyFortunes } from "@/lib/companion-service";
import { prisma } from "@/lib/db";
import { dayKey } from "@/lib/daily";
import { dailyAffirmation, dailyFortune } from "@/lib/keeps";
import { ollamaComplete } from "@/lib/ollama-complete";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, letterRequestSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  await ensureDailyFortunes(auth.session.user.id);
  const fortunes = await prisma.fortune.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 14,
  });
  return Response.json({ fortunes });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = letterRequestSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const ensured = await ensureCompanionConfig(auth.session.user.id, parsed.data.slug);
  if (!ensured) return Response.json({ error: "Companion not found" }, { status: 404 });
  const today = dayKey();
  const fallback = dailyFortune(parsed.data.slug, ensured.config.nickname);
  const generated = await ollamaComplete(
    `You are ${ensured.config.nickname}, a 21-year-old companion. Give a two-sentence fortune for today. Adult, gentle, no lists.`,
    "What does today want from me?",
  );
  const fortune = await prisma.fortune.upsert({
    where: {
      userId_slug_day: { userId: auth.session.user.id, slug: parsed.data.slug, day: today },
    },
    update: { body: generated ?? fallback },
    create: {
      userId: auth.session.user.id,
      slug: parsed.data.slug,
      day: today,
      body: generated ?? fallback,
    },
  });
  return Response.json({
    fortune,
    affirmation: dailyAffirmation(ensured.config.nickname),
  });
}
