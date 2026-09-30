import { prisma } from "@/lib/db";
import { jsonError, jsonOk, readJsonLimited, retryAfterSeconds } from "@/lib/http";
import { clientKey, isSameOrigin, rateLimit } from "@/lib/security";
import { abuseSchema, firstZodError } from "@/lib/validation";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return jsonError("Invalid origin", 403, { request });
  const limited = await rateLimit(`abuse:${clientKey(request)}`, 5, 60 * 60_000);
  if (!limited.ok) {
    return jsonError("Wait a moment", 429, { request, retryAfter: retryAfterSeconds(limited.retryAt) });
  }
  const raw = await readJsonLimited(request, 8_192);
  if (!raw.ok) return jsonError(raw.error, 400, { request });
  const parsed = abuseSchema.safeParse(raw.data);
  if (!parsed.success) return jsonError(firstZodError(parsed.error), 400, { request });
  const item = await prisma.abuseReport.create({
    data: {
      email: parsed.data.email ?? "",
      body: parsed.data.body,
      href: parsed.data.href ?? "",
    },
  });
  return jsonOk({ ok: true, id: item.id }, { request });
}
