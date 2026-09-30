import { prisma } from "@/lib/db";
import { jsonError, jsonOk, readJsonLimited, retryAfterSeconds } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/security";
import { requireSession } from "@/lib/session-guard";
import { clientErrorSchema, firstZodError } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const limited = await rateLimit(`errors:${auth.session.user.id}:${clientKey(request)}`, 20, 60 * 60_000);
  if (!limited.ok) {
    return jsonError("Wait a moment", 429, { request, retryAfter: retryAfterSeconds(limited.retryAt) });
  }
  const raw = await readJsonLimited(request, 8_192);
  if (!raw.ok) return jsonError(raw.error, 400, { request });
  const parsed = clientErrorSchema.safeParse(raw.data);
  if (!parsed.success) return jsonError(firstZodError(parsed.error), 400, { request });
  const item = await prisma.feedback.create({
    data: {
      userId: auth.session.user.id,
      kind: "crash",
      body: `${parsed.data.message}${parsed.data.digest ? ` [${parsed.data.digest}]` : ""}`,
      href: parsed.data.href ?? "",
    },
  });
  return jsonOk({ item }, { request });
}
