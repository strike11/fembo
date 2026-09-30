import { ensureCompanionConfig } from "@/lib/companion-service";

import { buildCompanionTurn } from "@/lib/companion-turn";

import { beginChatTurn, compensateFailedTurn, TurnConflictError } from "@/lib/chat-turn";

import { prisma } from "@/lib/db";

import { streamCompanionChat } from "@/lib/ollama-stream";

import { maybeMemoryFromMessage } from "@/lib/platform";

import { getQuota, quotaDeniedResponse } from "@/lib/quota";

import { clientKey, isSameOrigin, rateLimit } from "@/lib/security";

import { getSession } from "@/lib/session";

import { callTurnSchema, firstZodError } from "@/lib/validation";



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

  const limited = await rateLimit(`callturn:${session.user.id}:${clientKey(request)}`, 30, 60_000);

  if (!limited.ok) {

    return new Response(JSON.stringify({ error: "Slow down a little" }), { status: 429 });

  }



  const parsed = callTurnSchema.safeParse(await request.json());

  if (!parsed.success) {

    return new Response(JSON.stringify({ error: firstZodError(parsed.error) }), { status: 400 });

  }



  const call = await prisma.callSession.findFirst({

    where: { id: parsed.data.callId, userId: session.user.id },

  });

  if (!call || call.endedAt) {

    return new Response(JSON.stringify({ error: "Call is not active" }), { status: 404 });

  }



  const ensured = await ensureCompanionConfig(session.user.id, parsed.data.slug);

  if (!ensured) {

    return new Response(JSON.stringify({ error: "Companion not found" }), { status: 404 });

  }



  const spoken = parsed.data.content?.trim() ?? "";

  if (!parsed.data.greet && !spoken) {

    return new Response(JSON.stringify({ error: "Say something" }), { status: 400 });

  }



  if (spoken) {

    const quota = await getQuota(session.user.id);

    if (!quota.ok) {

      return quotaDeniedResponse(quota, session.user.id);

    }

    const fact = maybeMemoryFromMessage(spoken);

    if (fact) {

      await prisma.memory.create({

        data: { userId: session.user.id, slug: parsed.data.slug, content: fact },

      });

    }

  }



  const idempotencyKey =

    parsed.data.idempotencyKey ??

    `call:${call.id}:${spoken || "greet"}:${crypto.randomUUID()}`;



  let turn;

  try {

    if (spoken) {

      turn = await beginChatTurn({

        userId: session.user.id,

        conversationId: ensured.conversation.id,

        idempotencyKey,

        mode: "call",

        userContent: spoken,

      });

    }



    const built = await buildCompanionTurn({

      userId: session.user.id,

      slug: parsed.data.slug,

      conversationId: ensured.conversation.id,

      mode: "call",

      callMode: true,

      greetCall: parsed.data.greet && !spoken,

      ensured,

    });

    if (!built) {

      if (turn) await compensateFailedTurn(turn).catch(() => undefined);

      return new Response(JSON.stringify({ error: "Conversation not found" }), { status: 404 });

    }



    return streamCompanionChat({

      system: built.system,

      history: built.history,

      conversationId: ensured.conversation.id,

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

