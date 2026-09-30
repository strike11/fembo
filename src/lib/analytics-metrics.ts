import { prisma } from "@/lib/db";

export type BetaMetricsSnapshot = {
  windowDays: number;
  signups: number;
  firstChat: number;
  tenMessages: number;
  d1Returns: number;
  d7Returns: number;
  visualOpens: number;
  callStarts: number;
  quotaHits: number;
  checkoutStarts: number;
  paidEvents: number;
  cancelEvents: number;
  providerErrors: number;
  signupToFirstChatPct: number | null;
  signupToFirstReplyPct: number | null;
  signupToTenMessagesPct: number | null;
  d7RetentionPct: number | null;
  providerSuccessPct: number | null;
  firstTokenP95Ms: number | null;
  usageCompleted: number;
  usageFailed: number;
  totalCostUsd: number;
  paidUsers: number;
};

function pct(numerator: number, denominator: number) {
  if (denominator <= 0) {
    return null;
  }
  return Math.round((numerator / denominator) * 1000) / 10;
}

function percentile(values: number[], p: number) {
  if (values.length === 0) {
    return null;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[index] ?? null;
}

export async function getBetaMetricsSnapshot(windowDays = 30): Promise<BetaMetricsSnapshot> {
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const [
    eventCounts,
    usageRows,
    paidUsers,
    usersWithAssistantReply,
  ] = await Promise.all([
    prisma.analyticsEvent.groupBy({
      by: ["name"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.usageLedger.findMany({
      where: { createdAt: { gte: since } },
      select: { status: true, latencyMs: true, costUsd: true },
    }),
    prisma.user.count({
      where: {
        plusUntil: { gt: new Date() },
        createdAt: { gte: since },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: since },
        conversations: {
          some: {
            messages: { some: { role: "assistant" } },
          },
        },
      },
    }),
  ]);

  const counts = new Map(eventCounts.map((row) => [row.name, row._count._all]));
  const signups = counts.get("signup") ?? 0;
  const firstChat = counts.get("first_chat") ?? 0;
  const tenMessages = counts.get("10_messages") ?? 0;
  const d1Returns = counts.get("d1_return") ?? 0;
  const d7Returns = counts.get("d7_return") ?? 0;

  const usageCompleted = usageRows.filter((row) => row.status === "completed").length;
  const usageFailed = usageRows.filter((row) => row.status === "failed").length;
  const usageTotal = usageCompleted + usageFailed;
  const latencies = usageRows
    .filter((row) => row.status === "completed" && row.latencyMs > 0)
    .map((row) => row.latencyMs);
  const totalCostUsd = usageRows.reduce((sum, row) => sum + row.costUsd, 0);

  return {
    windowDays,
    signups,
    firstChat,
    tenMessages,
    d1Returns,
    d7Returns,
    visualOpens: counts.get("visual_open") ?? 0,
    callStarts: counts.get("call_start") ?? 0,
    quotaHits: counts.get("quota_hit") ?? 0,
    checkoutStarts: counts.get("checkout_start") ?? 0,
    paidEvents: counts.get("paid") ?? 0,
    cancelEvents: counts.get("cancel") ?? 0,
    providerErrors: counts.get("provider_error") ?? 0,
    signupToFirstChatPct: pct(firstChat, signups),
    signupToFirstReplyPct: pct(usersWithAssistantReply, signups),
    signupToTenMessagesPct: pct(tenMessages, signups),
    d7RetentionPct: pct(d7Returns, signups),
    providerSuccessPct: pct(usageCompleted, usageTotal),
    firstTokenP95Ms: percentile(latencies, 95),
    usageCompleted,
    usageFailed,
    totalCostUsd: Math.round(totalCostUsd * 10000) / 10000,
    paidUsers,
  };
}
