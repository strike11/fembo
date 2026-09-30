import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const ANALYTICS_EVENTS = [
  "signup",
  "first_chat",
  "10_messages",
  "visual_open",
  "call_start",
  "d1_return",
  "d7_return",
  "quota_hit",
  "checkout_start",
  "paid",
  "cancel",
  "provider_error",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

const FORBIDDEN_METADATA_KEYS = new Set([
  "content",
  "message",
  "messages",
  "text",
  "body",
  "prompt",
  "snippet",
  "transcript",
  "history",
  "reply",
  "assistantcontent",
  "usercontent",
]);

const MAX_METADATA_STRING_LENGTH = 200;

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value);
}

export function sanitizeAnalyticsMetadata(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    const normalizedKey = key.trim().toLowerCase();
    if (FORBIDDEN_METADATA_KEYS.has(normalizedKey)) {
      continue;
    }

    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === "string") {
      out[key] = value.slice(0, MAX_METADATA_STRING_LENGTH);
      continue;
    }

    if (typeof value === "number" || typeof value === "boolean") {
      out[key] = value;
      continue;
    }

    if (Array.isArray(value)) {
      out[key] = value
        .slice(0, 20)
        .map((item) =>
          typeof item === "string"
            ? item.slice(0, MAX_METADATA_STRING_LENGTH)
            : typeof item === "number" || typeof item === "boolean"
              ? item
              : null,
        )
        .filter((item) => item !== null);
      continue;
    }

    if (typeof value === "object") {
      out[key] = sanitizeAnalyticsMetadata(value as Record<string, unknown>);
    }
  }

  return out;
}

type AdminMetricsEnv = {
  NODE_ENV?: string;
  ADMIN_EMAILS?: string;
};

export function canViewAdminMetrics(
  email: string | null | undefined,
  env: AdminMetricsEnv = process.env,
) {
  if (env.NODE_ENV !== "production") {
    return true;
  }
  const admins = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (admins.length === 0) {
    return false;
  }
  return Boolean(email && admins.includes(email.toLowerCase()));
}

export async function trackEvent(
  name: AnalyticsEventName,
  options?: { userId?: string; metadata?: Record<string, unknown> },
) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        userId: options?.userId ?? null,
        name,
        metadata: sanitizeAnalyticsMetadata(
          options?.metadata ?? {},
        ) as Prisma.InputJsonValue,
      },
    });
  } catch {
    /* analytics must not break product flows */
  }
}

export async function trackEventOnce(
  userId: string,
  name: AnalyticsEventName,
  metadata?: Record<string, unknown>,
) {
  try {
    const existing = await prisma.analyticsEvent.findFirst({
      where: { userId, name },
      select: { id: true },
    });
    if (existing) {
      return false;
    }
    await trackEvent(name, { userId, metadata });
    return true;
  } catch {
    return false;
  }
}

export async function trackChatMilestones(userId: string) {
  try {
    const total = await prisma.message.count({
      where: { role: "user", conversation: { userId } },
    });
    if (total === 1) {
      await trackEventOnce(userId, "first_chat");
    }
    if (total === 10) {
      await trackEventOnce(userId, "10_messages");
    }
  } catch {
    /* ignore */
  }
}

export async function trackReturnVisit(userId: string, userCreatedAt: Date) {
  const dayMs = 24 * 60 * 60 * 1000;
  const ageMs = Date.now() - userCreatedAt.getTime();
  if (ageMs >= dayMs) {
    await trackEventOnce(userId, "d1_return");
  }
  if (ageMs >= 7 * dayMs) {
    await trackEventOnce(userId, "d7_return");
  }
}
