import { ensureCompanionConfig, unlockLoreForSlug } from "@/lib/companion-service";

import { buildCompanionTurn } from "@/lib/companion-turn";

import { beginChatTurn, compensateFailedTurn, TurnConflictError } from "@/lib/chat-turn";

import { prisma } from "@/lib/db";

import { streamCompanionChat } from "@/lib/ollama-stream";

import { rememberFact } from "@/lib/platform";

import { getQuota, quotaDeniedResponse } from "@/lib/quota";

import { clientKey, isSameOrigin, rateLimit } from "@/lib/security";

import { getSession } from "@/lib/session";

import { chatSchema, firstZodError } from "@/lib/validation";



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

  const limited = await rateLimit(`chat:${session.user.id}:${clientKey(request)}`, 20, 60_000);

  if (!limited.ok) {

    return new Response(JSON.stringify({ error: "Give the conversation a moment" }), {

      status: 429,

    });

  }



  const parsed = chatSchema.safeParse(await request.json());

  if (!parsed.success) {

    return new Response(JSON.stringify({ error: firstZodError(parsed.error) }), {

      status: 400,

    });

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

      select: { id: true, scene: true },

    });

    if (requested) conversationId = requested.id;

  }



  const quota = await getQuota(session.user.id);

  if (!quota.ok) {

    return quotaDeniedResponse(quota, session.user.id);

  }



  const idempotencyKey =

    parsed.data.idempotencyKey ??

    `chat:${conversationId}:${crypto.randomUUID()}`;



  try {

    const conversation = await prisma.conversation.findUnique({

      where: { id: conversationId },

      select: { scene: true },

    });



    const turn = await beginChatTurn({

      userId: session.user.id,

      conversationId,

      idempotencyKey,

      mode: "chat",

      userContent: parsed.data.content,

      scene: parsed.data.scene ?? conversation?.scene,

    });



    const built = await buildCompanionTurn({

      userId: session.user.id,

      slug: parsed.data.slug,

      conversationId,

      mode: "chat",

      visual: parsed.data.visual,

      sceneOverride: parsed.data.scene,

      ensured,

    });

    if (!built) {

      await compensateFailedTurn(turn).catch(() => undefined);

      return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404 });

    }



    void rememberFact(session.user.id, parsed.data.slug, parsed.data.content);

    void unlockLoreForSlug(session.user.id, parsed.data.slug);



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

