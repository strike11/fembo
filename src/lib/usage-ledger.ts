import { prisma } from "@/lib/db";
import { resolveChatProviderId } from "@/lib/chat-provider";

export function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function estimateCostUsd(promptTokens: number, completionTokens: number) {
  const promptRate = 0.00000015;
  const completionRate = 0.0000006;
  return promptTokens * promptRate + completionTokens * completionRate;
}

export async function recordUsageEntry(input: {
  userId: string;
  conversationId?: string;
  turnId?: string;
  model: string;
  system: string;
  history: Array<{ role: string; content: string }>;
  completion: string;
  latencyMs: number;
  status: "completed" | "failed";
}) {
  const promptTokens =
    estimateTokens(input.system) +
    input.history.reduce((sum, message) => sum + estimateTokens(message.content), 0);
  const completionTokens = input.completion ? estimateTokens(input.completion) : 0;
  const provider = resolveChatProviderId();
  await prisma.usageLedger.create({
    data: {
      userId: input.userId,
      conversationId: input.conversationId,
      turnId: input.turnId,
      provider,
      model: input.model,
      promptTokens,
      completionTokens,
      costUsd: estimateCostUsd(promptTokens, completionTokens),
      latencyMs: input.latencyMs,
      status: input.status,
    },
  });
}

export async function sumDailyCostUsd(userId: string, since: Date) {
  const rows = await prisma.usageLedger.findMany({
    where: { userId, createdAt: { gte: since }, status: "completed" },
    select: { costUsd: true },
  });
  return rows.reduce((sum, row) => sum + row.costUsd, 0);
}

export async function sumDailyTokens(userId: string, since: Date) {
  const rows = await prisma.usageLedger.findMany({
    where: { userId, createdAt: { gte: since }, status: "completed" },
    select: { promptTokens: true, completionTokens: true },
  });
  return rows.reduce((sum, row) => sum + row.promptTokens + row.completionTokens, 0);
}
