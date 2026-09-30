import { ensureCompanionConfig, ensureDailyLetters } from "@/lib/companion-service";
import { dailyLetter } from "@/lib/daily";
import { prisma } from "@/lib/db";
import { ollamaComplete } from "@/lib/ollama-complete";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";
import { firstZodError, letterRequestSchema } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  await ensureDailyLetters(session.user.id);
  const letters = await prisma.letter.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return Response.json({ letters });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const parsed = letterRequestSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });

  const ensured = await ensureCompanionConfig(session.user.id, parsed.data.slug);
  if (!ensured) return Response.json({ error: "Companion not found" }, { status: 404 });

  const fallback = dailyLetter(parsed.data.slug, ensured.config.nickname);
  const generated = await ollamaComplete(
    `You are ${ensured.config.nickname}, a 21-year-old companion writing a short private letter. 4-7 sentences. Warm, in character, adult. No lists or markdown.`,
    "Write me a letter I can keep.",
  );

  const letter = await prisma.letter.create({
    data: {
      userId: session.user.id,
      slug: parsed.data.slug,
      title: fallback.title,
      body: generated ?? fallback.body,
    },
  });
  await prisma.notification.create({
    data: {
      userId: session.user.id,
      title: `Letter from ${ensured.config.nickname}`,
      body: "They left something for you.",
      href: "/app/letters",
    },
  });
  return Response.json({ letter });
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  await prisma.letter.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });
  return Response.json({ ok: true });
}
