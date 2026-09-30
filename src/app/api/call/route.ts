import { trackEvent } from "@/lib/analytics";

import { ensureCompanionConfig } from "@/lib/companion-service";

import { TURN_HISTORY_LIMIT } from "@/lib/companion-turn";

import { prisma } from "@/lib/db";

import { resolveAssetUrl } from "@/lib/storage";

import { clientKey, isSameOrigin, rateLimit } from "@/lib/security";

import { getSession } from "@/lib/session";

import { firstZodError, slugSchema } from "@/lib/validation";

import { z } from "zod";



const startSchema = z.object({ slug: slugSchema });



export async function POST(request: Request) {

  if (!isSameOrigin(request)) {

    return Response.json({ error: "Invalid origin" }, { status: 403 });

  }

  const session = await getSession();

  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });

  const limited = await rateLimit(`call:${session.user.id}:${clientKey(request)}`, 10, 60_000);

  if (!limited.ok) return Response.json({ error: "Wait a moment before another call" }, { status: 429 });



  const parsed = startSchema.safeParse(await request.json());

  if (!parsed.success) {

    return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });

  }

  const ensured = await ensureCompanionConfig(session.user.id, parsed.data.slug);

  if (!ensured) return Response.json({ error: "Companion not found" }, { status: 404 });



  void trackEvent("call_start", {

    userId: session.user.id,

    metadata: { slug: parsed.data.slug },

  });



  const [call, history] = await Promise.all([

    prisma.callSession.create({

      data: { userId: session.user.id, slug: parsed.data.slug },

    }),

    prisma.message.findMany({

      where: { conversationId: ensured.conversation.id },

      orderBy: { createdAt: "asc" },

      take: TURN_HISTORY_LIMIT,

      select: { id: true, role: true, content: true },

    }),

  ]);



  return Response.json({

    callId: call.id,

    nickname: ensured.config.nickname,

    voiceId: ensured.config.voiceId,

    avatarPath: resolveAssetUrl(ensured.preset.avatarPath),

    history,

  });

}



export async function GET() {

  const session = await getSession();

  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });

  const calls = await prisma.callSession.findMany({

    where: { userId: session.user.id },

    orderBy: { startedAt: "desc" },

    take: 30,

  });

  return Response.json({ calls });

}

