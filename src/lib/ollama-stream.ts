import { trackEvent } from "@/lib/analytics";
import { prisma } from "@/lib/db";
import {
  CHAT_STREAM_TIMEOUT_MS,
  ChatProviderError,
  resolveChatModel,
  resolveChatProviders,
  type ChatMessage,
} from "@/lib/chat-provider";
import { looksLikePolicyRefusal, sanitizeCompanionReply } from "@/lib/prompt";
import { applyStreamPiece } from "@/lib/stream-text";
import {
  completeChatTurn,
  compensateFailedTurn,
  type TurnContext,
} from "@/lib/chat-turn";
import { recordUsageEntry } from "@/lib/usage-ledger";

export async function streamCompanionChat({
  system,
  history,
  conversationId,
  persistAssistant = true,
  model,
  turn,
  userId,
}: {
  system: string;
  history: { role: "user" | "assistant"; content: string }[];
  conversationId?: string;
  persistAssistant?: boolean;
  model?: string;
  turn?: TurnContext;
  userId?: string;
}) {
  const resolvedModel = model || resolveChatModel();
  const encoder = new TextEncoder();
  const startedAt = Date.now();

  const baseMessages: ChatMessage[] = [
    { role: "system", content: system },
    ...history.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let full = await runCompanionTurn({
          model: resolvedModel,
          messages: baseMessages,
          encoder,
          controller,
          emit: true,
        });
        const safe = sanitizeCompanionReply(full);
        if (safe !== full) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ reset: true })}\n\n`));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: safe })}\n\n`));
          full = safe;
        }

        if (persistAssistant && conversationId && full.trim()) {
          if (turn) {
            await completeChatTurn(turn, full);
          } else {
            await prisma.message.create({
              data: { conversationId, role: "assistant", content: full },
            });
            await prisma.conversation.update({
              where: { id: conversationId },
              data: { lastMessageAt: new Date() },
            });
          }
        }

        const ledgerUserId = turn?.userId ?? userId;
        if (ledgerUserId) {
          await recordUsageEntry({
            userId: ledgerUserId,
            conversationId,
            turnId: turn?.id,
            model: resolvedModel,
            system,
            history,
            completion: full,
            latencyMs: Date.now() - startedAt,
            status: "completed",
          });
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, full })}\n\n`),
        );
        controller.close();
      } catch (error) {
        if (turn) {
          await compensateFailedTurn(turn).catch(() => undefined);
          const ledgerUserId = turn.userId ?? userId;
          if (ledgerUserId) {
            await recordUsageEntry({
              userId: ledgerUserId,
              conversationId,
              turnId: turn.id,
              model: resolvedModel,
              system,
              history,
              completion: "",
              latencyMs: Date.now() - startedAt,
              status: "failed",
            }).catch(() => undefined);
          }
        }
        const payload =
          error instanceof ChatProviderError
            ? { code: error.code, error: error.message }
            : { code: "provider_error", error: "Could not reach the chat provider. Try again." };
        const ledgerUserId = turn?.userId ?? userId;
        if (ledgerUserId) {
          void trackEvent("provider_error", {
            userId: ledgerUserId,
            metadata: {
              code: payload.code,
              model: resolvedModel,
              conversationId: conversationId ?? null,
            },
          });
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

/** @deprecated Use streamCompanionChat */
export const streamOllamaChat = streamCompanionChat;

async function runCompanionTurn({
  model,
  messages,
  encoder,
  controller,
  emit,
}: {
  model: string;
  messages: ChatMessage[];
  encoder: TextEncoder;
  controller: ReadableStreamDefaultController<Uint8Array>;
  emit: boolean;
}) {
  const providers = resolveChatProviders();
  let lastError: ChatProviderError | null = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    for (const provider of providers) {
      const providerModel =
        provider.id === "openrouter" && !model.includes("/") ? resolveChatModel() : model;
      const controllerSignal = new AbortController();
      const timer = setTimeout(() => controllerSignal.abort(), CHAT_STREAM_TIMEOUT_MS);
      try {
        const stream = provider.streamChat({
          model: providerModel,
          messages,
          temperature: 0.72,
          topP: 0.92,
          repeatPenalty: 1.1,
          signal: controllerSignal.signal,
        });

        let full = "";

        let iteratorResult = await stream.next();
        while (!iteratorResult.done) {
          const piece = iteratorResult.value.delta ?? "";
          const applied = applyStreamPiece(full, piece);
          full = applied.full;
          if (applied.delta && emit && !looksLikePolicyRefusal(full)) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ delta: applied.delta })}\n\n`),
            );
          }
          iteratorResult = await stream.next();
        }

        full = iteratorResult.value || full;
        return full;
      } catch (error) {
        if (error instanceof ChatProviderError) {
          lastError = error;
          if (error.code === "timeout" || error.code === "provider_error") {
            continue;
          }
          throw error;
        }
        if (error instanceof Error && error.name === "AbortError") {
          lastError = new ChatProviderError("timeout", "The companion took too long to respond.");
          continue;
        }
        lastError = new ChatProviderError("provider_error", "Could not reach the chat provider.");
      } finally {
        clearTimeout(timer);
      }
    }
  }

  throw lastError ?? new ChatProviderError("provider_error", "Could not reach the chat provider.");
}
