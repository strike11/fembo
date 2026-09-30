import { ensureCompanionConfig, ensureDailyDreams } from "@/lib/companion-service";
import { dailyDream } from "@/lib/dreams";
import { prisma } from "@/lib/db";
import { ollamaComplete } from "@/lib/ollama-complete";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";
import { dreamRequestSchema, firstZodError } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  await ensureDailyDreams(session.user.id);
  const dreams = await prisma.dream.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return Response.json({ dreams });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const parsed = dreamRequestSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const ensured = await ensureCompanionConfig(session.user.id, parsed.data.slug);
  if (!ensured) return Response.json({ error: "Companion not found" }, { status: 404 });
  const fallback = dailyDream(parsed.data.slug, ensured.config.nickname);
  const generated = await ollamaComplete(
    `You are ${ensured.config.nickname}, a 21-year-old companion. Describe a short dream in 3-5 sentences. Soft, adult, no lists.`,
    "Tell me what you dreamed last night.",
  );
  const dream = await prisma.dream.create({
    data: { userId: session.user.id, slug: parsed.data.slug, body: generated ?? fallback },
  });
  return Response.json({ dream });
}
