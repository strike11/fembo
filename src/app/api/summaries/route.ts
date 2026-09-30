import { prisma } from "@/lib/db";
import { fallbackSummary } from "@/lib/keeps";
import { ollamaComplete } from "@/lib/ollama-complete";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, summarySchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const summaries = await prisma.threadSummary.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return Response.json({ summaries });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = summarySchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const conversation = await prisma.conversation.findFirst({
    where: { id: parsed.data.conversationId, userId: auth.session.user.id },
    include: {
      config: true,
      messages: { orderBy: { createdAt: "asc" }, take: 40 },
    },
  });
  if (!conversation) return Response.json({ error: "Chat not found" }, { status: 404 });
  const transcript = conversation.messages
    .map((item) => `${item.role === "user" ? "You" : conversation.config.nickname}: ${item.content}`)
    .join("\n");
  const last = [...conversation.messages].reverse().find((item) => item.role === "assistant")?.content ?? "";
  const generated = transcript
    ? await ollamaComplete(
        `Summarize this gentle companion chat in 3 soft sentences. Stay SFW. No lists.`,
        transcript.slice(-3500),
      )
    : null;
  const summary = await prisma.threadSummary.create({
    data: {
      userId: auth.session.user.id,
      slug: parsed.data.slug,
      conversationId: conversation.id,
      body:
        generated ??
        fallbackSummary(conversation.config.nickname, conversation.messages.length, last),
    },
  });
  return Response.json({ summary });
}
