import { ensureCompanionConfig } from "@/lib/companion-service";
import { prisma } from "@/lib/db";
import { ollamaComplete } from "@/lib/ollama-complete";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";
import { sleepStory } from "@/lib/stories";
import { firstZodError, storyRequestSchema } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const stories = await prisma.sleepStory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return Response.json({ stories });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const parsed = storyRequestSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const ensured = await ensureCompanionConfig(session.user.id, parsed.data.slug);
  if (!ensured) return Response.json({ error: "Companion not found" }, { status: 404 });
  const fallback = sleepStory(parsed.data.slug, ensured.config.nickname);
  const generated = await ollamaComplete(
    `You are ${ensured.config.nickname}, a 21-year-old companion telling a short bedtime story. 5-8 gentle sentences. Adult, no lists.`,
    "Tell me a sleep story.",
  );
  const story = await prisma.sleepStory.create({
    data: {
      userId: session.user.id,
      slug: parsed.data.slug,
      title: fallback.title,
      body: generated ?? fallback.body,
    },
  });
  return Response.json({ story });
}
