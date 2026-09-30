import { ensureCompanionConfig } from "@/lib/companion-service";

import { prisma } from "@/lib/db";

import { resolveChatModel } from "@/lib/chat-provider";

import { compileCompanionPrompt, PROMPT_MEMORY_LIMIT } from "@/lib/prompt";

import { loadPromptFlavor } from "@/lib/prompt-flavor";

import { sceneById } from "@/lib/scenes";



export const TURN_HISTORY_LIMIT = 12;

export const TURN_MEMORY_LIMIT = PROMPT_MEMORY_LIMIT;



export type CompanionTurnMode = "chat" | "call" | "regenerate";



type EnsuredCompanion = NonNullable<Awaited<ReturnType<typeof ensureCompanionConfig>>>;



export async function buildCompanionTurn(input: {

  userId: string;

  slug: string;

  conversationId: string;

  mode: CompanionTurnMode;

  visual?: boolean;

  callMode?: boolean;

  greetCall?: boolean;

  sceneOverride?: string;

  userContent?: string;

  excludeMessageIds?: string[];

  ensured?: EnsuredCompanion;

}) {

  const ensured =

    input.ensured ?? (await ensureCompanionConfig(input.userId, input.slug));

  if (!ensured) return null;



  const conversation = await prisma.conversation.findFirst({

    where: {

      id: input.conversationId,

      userId: input.userId,

      configId: ensured.config.id,

    },

    select: { id: true, scene: true, title: true },

  });

  if (!conversation) return null;



  const [memories, summary, history, flavor] = await Promise.all([

    prisma.memory.findMany({

      where: { userId: input.userId, slug: input.slug },

      orderBy: { createdAt: "desc" },

      take: TURN_MEMORY_LIMIT,

      select: { content: true },

    }),

    prisma.threadSummary.findFirst({

      where: { userId: input.userId, conversationId: conversation.id },

      orderBy: { createdAt: "desc" },

      select: { body: true },

    }),

    prisma.message.findMany({

      where: {

        conversationId: conversation.id,

        ...(input.excludeMessageIds?.length

          ? { id: { notIn: input.excludeMessageIds } }

          : {}),

      },

      orderBy: { createdAt: "desc" },

      take: TURN_HISTORY_LIMIT,

      select: { id: true, role: true, content: true },

    }),

    loadPromptFlavor(input.userId, input.slug),

  ]);



  const sceneId = input.sceneOverride ?? conversation.scene;

  const scene = sceneById(sceneId);

  const orderedHistory = history.reverse();

  const system = compileCompanionPrompt({

    slug: input.slug,

    nickname: ensured.config.nickname,

    kind: ensured.preset.kind,

    lore: ensured.preset.lore,

    shyBold: ensured.config.shyBold,

    sweetTeasing: ensured.config.sweetTeasing,

    calmEnergetic: ensured.config.calmEnergetic,

    treatYou: ensured.config.treatYou,

    appearanceNotes: ensured.config.appearanceNotes,

    callYou: ensured.config.callYou,

    memories: memories.map((item) => item.content),

    scene: scene.prompt,

    visualMode: input.visual ?? false,

    craft: ensured.preset.craft || undefined,

    summary: summary?.body,

    callMode: input.callMode,

    greetCall: input.greetCall,

    ...flavor,

  });



  return {

    ensured,

    conversation,

    system,

    history: orderedHistory,

    model: resolveChatModel(),

    sceneId,

  };

}

