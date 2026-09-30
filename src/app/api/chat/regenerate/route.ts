import { ensureCompanionConfig } from "@/lib/companion-service";
import { buildCompanionTurn } from "@/lib/companion-turn";
import { beginChatTurn, TurnConflictError } from "@/lib/chat-turn";
import { prisma } from "@/lib/db";
import { streamCompanionChat } from "@/lib/ollama-stream";
import { getQuota, quotaDeniedResponse } from "@/lib/quota";
import { clientKey, isSameOrigin, rateLimit } from "@/lib/security";
import { getSession } from "@/lib/session";
import { firstZodError, regenerateSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return new Response(JSON.stringify({ error: "Invalid origin" }), { status: 403 });
  }
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Sign in first" }), { status: 401 });
  }
  const limited = await rateLimit(`regen:${session.user.id}:${clientKey(request)}`, 12, 60_000);
  if (!limited.ok) {
    return new Response(JSON.stringify({ error: "Give it a moment" }), { status: 429 });
  }

  const parsed = regenerateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: firstZodError(parsed.error) }), { status: 400 });
  }

  const quota = await getQuota(session.user.id);
  if (!quota.ok) {
    return quotaDeniedResponse(quota, session.user.id);
  }

  const ensured = await ensureCompanionConfig(session.user.id, parsed.data.slug);
  if (!ensured) {
    return new Response(JSON.stringify({ error: "Companion not found" }), { status: 404 });
  }

  let conversationId = ensured.conversation.id;
  if (parsed.data.conversationId) {
    const requested = await prisma.conversation.findFirst({
      where: {
        id: parsed.data.conversationId,
        userId: session.user.id,
        configId: ensured.config.id,
      },
      select: { id: true },
    });
    if (requested) conversationId = requested.id;
  }

  const lastAssistant = await prisma.message.findFirst({
    where: { conversationId, role: "assistant" },
    orderBy: { createdAt: "desc" },
  });
  if (!lastAssistant) {
    return new Response(JSON.stringify({ error: "Nothing to regenerate" }), { status: 400 });
  }

  const idempotencyKey =
    parsed.data.idempotencyKey ??
    `regen:${conversationId}:${lastAssistant.id}:${crypto.randomUUID()}`;

  try {
    const built = await buildCompanionTurn({
      userId: session.user.id,
      slug: parsed.data.slug,
      conversationId,
      mode: "regenerate",
      visual: parsed.data.visual,
      excludeMessageIds: [lastAssistant.id],
      ensured,
    });
    if (!built) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404 });
    }

    const turn = await beginChatTurn({
      userId: session.user.id,
      conversationId,
      idempotencyKey,
      mode: "regenerate",
      replaceMessageId: lastAssistant.id,
    });

    return streamCompanionChat({
      system: built.system,
      history: built.history,
      conversationId,
      model: built.model,
      turn,
      userId: session.user.id,
    });
  } catch (error) {
    if (error instanceof TurnConflictError) {
      return new Response(JSON.stringify({ error: error.message, code: error.code }), {
        status: error.status,
      });
    }
    throw error;
  }
}
