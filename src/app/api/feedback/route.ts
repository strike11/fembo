import { prisma } from "@/lib/db";
import { jsonError, jsonOk, readJsonLimited, retryAfterSeconds } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/security";
import { requireSession } from "@/lib/session-guard";
import { feedbackSchema, firstZodError } from "@/lib/validation";

export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const items = await prisma.feedback.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return jsonOk({ items }, { request });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const limited = await rateLimit(`feedback:${auth.session.user.id}:${clientKey(request)}`, 8, 60 * 60_000);
  if (!limited.ok) {
    return jsonError("Wait a moment", 429, { request, retryAfter: retryAfterSeconds(limited.retryAt) });
  }
  const raw = await readJsonLimited(request, 8_192);
  if (!raw.ok) return jsonError(raw.error, 400, { request });
  const parsed = feedbackSchema.safeParse(raw.data);
  if (!parsed.success) return jsonError(firstZodError(parsed.error), 400, { request });
  const item = await prisma.feedback.create({
    data: {
      userId: auth.session.user.id,
      kind: parsed.data.kind,
      body: parsed.data.body,
      href: parsed.data.href ?? "",
    },
  });
  return jsonOk({ item }, { request });
}
