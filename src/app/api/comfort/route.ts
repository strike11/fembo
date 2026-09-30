import { ensureCompanionConfig } from "@/lib/companion-service";
import { comfortReply } from "@/lib/care";
import { prisma } from "@/lib/db";
import { ollamaComplete } from "@/lib/ollama-complete";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, pingSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const comforts = await prisma.comfortAsk.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return Response.json({ comforts });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = pingSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const ensured = await ensureCompanionConfig(auth.session.user.id, parsed.data.slug);
  if (!ensured) return Response.json({ error: "Companion not found" }, { status: 404 });
  const generated = await ollamaComplete(
    `You are ${ensured.config.nickname}. The user needs comfort. Reply in one or two warm adult sentences. No lists.`,
    "I need you.",
  );
  const comfort = await prisma.comfortAsk.create({
    data: {
      userId: auth.session.user.id,
      slug: parsed.data.slug,
      reply: generated ?? comfortReply(ensured.config.nickname),
    },
  });
  return Response.json({ comfort });
}
