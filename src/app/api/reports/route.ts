import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, readJsonLimited, retryAfterSeconds } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/security";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, reportSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const limited = await rateLimit(`report:${auth.session.user.id}:${clientKey(request)}`, 12, 60 * 60_000);
  if (!limited.ok) {
    return jsonError("Wait a moment", 429, { request, retryAfter: retryAfterSeconds(limited.retryAt) });
  }
  const raw = await readJsonLimited(request, 4_096);
  if (!raw.ok) return jsonError(raw.error, 400, { request });
  const parsed = reportSchema.safeParse(raw.data);
  if (!parsed.success) return jsonError(firstZodError(parsed.error), 400, { request });
  const report = await prisma.messageReport.create({
    data: { userId: auth.session.user.id, ...parsed.data },
  });
  await writeAudit(auth.session.user.id, "message.report", parsed.data.slug);
  return jsonOk({ report }, { request });
}
