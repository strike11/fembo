import { ensureCompanionConfig } from "@/lib/companion-service";
import { doorReply } from "@/lib/care";
import { prisma } from "@/lib/db";
import { ollamaComplete } from "@/lib/ollama-complete";
import { requireSession } from "@/lib/session-guard";
import { doorSchema, firstZodError } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const notes = await prisma.doorNote.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return Response.json({ notes });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = doorSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const ensured = await ensureCompanionConfig(auth.session.user.id, parsed.data.slug);
  if (!ensured) return Response.json({ error: "Companion not found" }, { status: 404 });
  const generated = await ollamaComplete(
    `You are ${ensured.config.nickname}. The user left a note on the door. Reply in one adult sentence.`,
    parsed.data.body,
  );
  const note = await prisma.doorNote.create({
    data: {
      userId: auth.session.user.id,
      slug: parsed.data.slug,
      body: parsed.data.body,
      reply: generated ?? doorReply(ensured.config.nickname, parsed.data.body),
    },
  });
  return Response.json({ note });
}
