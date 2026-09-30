import { trackEvent } from "@/lib/analytics";
import { prisma } from "@/lib/db";
import { hasPlus } from "@/lib/plus";
import { sumDailyCostUsd, sumDailyTokens } from "@/lib/usage-ledger";

export const FREE_MESSAGE_LIMIT = 30;
export const PLUS_MESSAGE_LIMIT = 500;
export const WINDOW_MS = 24 * 60 * 60 * 1000;
export const FREE_DAILY_TOKEN_CAP = 80_000;
export const PLUS_DAILY_COST_CAP_USD = 5;

export type Quota = {
  plus: boolean;
  ok: boolean;
  remaining: number | null;
  used: number;
  limit: number;
  retryAt: Date | null;
  message?: string;
};

export function computeRetryAt(oldestInWindow: Date | null, windowMs = WINDOW_MS, now = Date.now()) {
  if (oldestInWindow) {
    return new Date(oldestInWindow.getTime() + windowMs);
  }
  return new Date(now + windowMs);
}

export function messageLimitForPlus(plus: boolean) {
  return plus ? PLUS_MESSAGE_LIMIT : FREE_MESSAGE_LIMIT;
}

export async function getQuota(userId: string): Promise<Quota> {
  const plus = await hasPlus(userId);
  const limit = messageLimitForPlus(plus);
  const since = new Date(Date.now() - WINDOW_MS);

  const [used, oldest, dailyCost, dailyTokens] = await Promise.all([
    prisma.message.count({
      where: {
        role: "user",
        conversation: { userId },
        createdAt: { gte: since },
      },
    }),
    prisma.message.findFirst({
      where: {
        role: "user",
        conversation: { userId },
        createdAt: { gte: since },
      },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    sumDailyCostUsd(userId, since),
    sumDailyTokens(userId, since),
  ]);

  if (plus) {
    if (dailyCost >= PLUS_DAILY_COST_CAP_USD) {
      const retryAt = computeRetryAt(oldest?.createdAt ?? null);
      return {
        plus: true,
        ok: false,
        remaining: 0,
        used,
        limit,
        retryAt,
        message: `Fair-use cost cap reached for today. Try again after ${retryAt.toLocaleString()}.`,
      };
    }
    return {
      plus: true,
      ok: true,
      remaining: Math.max(0, limit - used),
      used,
      limit,
      retryAt: null,
    };
  }

  if (used >= limit || dailyTokens >= FREE_DAILY_TOKEN_CAP) {
    const retryAt = computeRetryAt(oldest?.createdAt ?? null);
    const reason =
      dailyTokens >= FREE_DAILY_TOKEN_CAP
        ? "Daily token cap reached"
        : `You've used ${limit} messages`;
    return {
      plus: false,
      ok: false,
      remaining: 0,
      used,
      limit,
      retryAt,
      message: `${reason}. Come back after ${retryAt.toLocaleString()}. Plus raises limits with fair-use caps.`,
    };
  }

  return {
    plus: false,
    ok: true,
    remaining: limit - used,
    used,
    limit,
    retryAt: null,
  };
}

export function quotaDeniedResponse(quota: Quota, userId?: string) {
  if (userId) {
    void trackEvent("quota_hit", {
      userId,
      metadata: { plus: quota.plus, used: quota.used, limit: quota.limit },
    });
  }
  const retryAt = quota.retryAt ?? new Date(Date.now() + WINDOW_MS);
  const retryAfter = Math.max(1, Math.ceil((retryAt.getTime() - Date.now()) / 1000));
  return new Response(
    JSON.stringify({
      error: quota.message ?? "Daily message limit reached",
      code: "quota",
      remaining: 0,
      retryAt: retryAt.toISOString(),
    }),
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    },
  );
}

export function plusRequiredResponse() {
  return new Response(
    JSON.stringify({
      error: "Plus is required to create your own femboy",
      code: "plus",
    }),
    { status: 402 },
  );
}

/** @deprecated use FREE_MESSAGE_LIMIT */
export const MESSAGE_LIMIT = FREE_MESSAGE_LIMIT;
