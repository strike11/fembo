import { argon2id, argon2Verify } from "hash-wasm";
import { prisma } from "@/lib/db";

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  return argon2id({
    password,
    salt,
    parallelism: 1,
    iterations: 3,
    memorySize: 19456,
    hashLength: 32,
    outputType: "encoded",
  });
}

export async function verifyPassword(password: string, hash: string) {
  try {
    return await argon2Verify({ password, hash });
  } catch {
    return false;
  }
}

export async function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const resetAt = new Date(now + windowMs);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.rateLimitBucket.findUnique({ where: { bucketKey: key } });
    if (!existing || existing.resetAt.getTime() <= now) {
      await tx.rateLimitBucket.upsert({
        where: { bucketKey: key },
        create: { bucketKey: key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return { ok: true as const, remaining: max - 1 };
    }
    if (existing.count >= max) {
      return {
        ok: false as const,
        remaining: 0,
        retryAt: existing.resetAt.getTime(),
      };
    }
    const updated = await tx.rateLimitBucket.update({
      where: { bucketKey: key },
      data: { count: { increment: 1 } },
    });
    return { ok: true as const, remaining: max - updated.count };
  });
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  if (!origin) {
    return process.env.NODE_ENV !== "production";
  }
  return origin === expected;
}

export function clientKey(request: Request, extra = "") {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "local";
  return extra ? `${extra}:${ip}` : ip;
}
