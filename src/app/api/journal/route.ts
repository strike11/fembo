import { ensureCompanionConfig } from "@/lib/companion-service";
import { journalReply } from "@/lib/daily";
import { prisma } from "@/lib/db";
import { ollamaComplete } from "@/lib/ollama-complete";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";
import { firstZodError, journalSchema } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const entries = await prisma.journalEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return Response.json({ entries });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const parsed = journalSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });

  const slug = parsed.data.slug || "aki";
  const ensured = await ensureCompanionConfig(session.user.id, slug);
  const nickname = ensured?.config.nickname ?? "Your companion";
  const generated = ensured
    ? await ollamaComplete(
        `You are ${nickname}, a 21-year-old companion. Reply to a journal check-in in 1 or 2 warm sentences. Stay adult. No lists.`,
        `The user feels ${parsed.data.mood}. They wrote: ${parsed.data.content}`,
      )
    : null;

  const entry = await prisma.journalEntry.create({
    data: {
      userId: session.user.id,
      slug,
      mood: parsed.data.mood,
      content: parsed.data.content,
      reply: generated ?? journalReply(nickname, parsed.data.mood, parsed.data.content),
    },
  });
  return Response.json({ entry });
}
