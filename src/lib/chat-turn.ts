import { trackChatMilestones } from "@/lib/analytics";

import { prisma } from "@/lib/db";

import type { ChatTurnMode } from "@prisma/client";



export type TurnContext = {

  id: string;

  userId: string;

  conversationId: string;

  mode: ChatTurnMode;

  userMessageId: string | null;

  replaceMessageId: string | null;

  priorScene: string;

};



export class TurnConflictError extends Error {

  readonly status: number;

  readonly code: string;



  constructor(message: string, code: string, status = 409) {

    super(message);

    this.code = code;

    this.status = status;

  }

}



export async function beginChatTurn(input: {

  userId: string;

  conversationId: string;

  idempotencyKey: string;

  mode: ChatTurnMode;

  userContent?: string;

  replaceMessageId?: string;

  scene?: string;

}) {

  const existing = await prisma.chatTurn.findUnique({

    where: {

      userId_idempotencyKey: {

        userId: input.userId,

        idempotencyKey: input.idempotencyKey,

      },

    },

  });

  if (existing?.status === "completed") {

    throw new TurnConflictError("This turn already completed", "turn_completed", 409);

  }

  if (existing?.status === "pending") {

    throw new TurnConflictError("This turn is still in progress", "turn_pending", 409);

  }



  const conversation = await prisma.conversation.findFirst({

    where: { id: input.conversationId, userId: input.userId },

    select: { scene: true },

  });

  if (!conversation) {

    throw new Error("Conversation not found");

  }



  let userMessageId: string | null = null;

  if (input.userContent?.trim()) {

    const userMessage = await prisma.message.create({

      data: {

        conversationId: input.conversationId,

        role: "user",

        content: input.userContent.trim(),

      },

    });

    userMessageId = userMessage.id;

    await prisma.conversation.update({

      where: { id: input.conversationId },

      data: {

        lastMessageAt: new Date(),

        scene: input.scene ?? conversation.scene,

      },

    });

    void trackChatMilestones(input.userId);

  }



  const turn = await prisma.chatTurn.create({

    data: {

      userId: input.userId,

      conversationId: input.conversationId,

      idempotencyKey: input.idempotencyKey,

      mode: input.mode,

      status: "pending",

      userMessageId,

      replaceMessageId: input.replaceMessageId ?? null,

      priorScene: conversation.scene,

    },

  });



  return {

    id: turn.id,

    userId: turn.userId,

    conversationId: turn.conversationId,

    mode: turn.mode,

    userMessageId,

    replaceMessageId: turn.replaceMessageId,

    priorScene: turn.priorScene,

  } satisfies TurnContext;

}



export async function completeChatTurn(turn: TurnContext, assistantContent: string) {

  await prisma.$transaction(async (tx) => {

    if (turn.replaceMessageId && assistantContent.trim()) {

      await tx.message.delete({ where: { id: turn.replaceMessageId } }).catch(() => undefined);

    }

    if (assistantContent.trim()) {

      await tx.message.create({

        data: {

          conversationId: turn.conversationId,

          role: "assistant",

          content: assistantContent,

        },

      });

    }

    const convo = await tx.conversation.findUnique({

      where: { id: turn.conversationId },

      select: { title: true },

    });

    const assistantCount = await tx.message.count({

      where: { conversationId: turn.conversationId, role: "assistant" },

    });

    const titlePatch =

      shouldSetConversationTitle(convo?.title ?? "", assistantCount) && assistantContent.trim()

        ? { title: assistantContent.slice(0, 48) }

        : {};

    await tx.conversation.update({

      where: { id: turn.conversationId },

      data: {

        lastMessageAt: new Date(),

        ...titlePatch,

      },

    });

    await tx.chatTurn.update({

      where: { id: turn.id },

      data: {

        status: "completed",

        assistantContent,

        completedAt: new Date(),

      },

    });

  });

}



export async function compensateFailedTurn(turn: TurnContext) {

  await prisma.$transaction(async (tx) => {

    if (turn.userMessageId) {

      await tx.message.delete({ where: { id: turn.userMessageId } }).catch(() => undefined);

    }

    await tx.conversation.update({

      where: { id: turn.conversationId },

      data: {

        scene: turn.priorScene,

      },

    });

    await tx.chatTurn.update({

      where: { id: turn.id },

      data: { status: "failed", completedAt: new Date() },

    });

  });

}



export function shouldSetConversationTitle(currentTitle: string, assistantCount: number) {

  if (currentTitle.trim()) return false;

  return assistantCount >= 1 && assistantCount <= 2;

}

