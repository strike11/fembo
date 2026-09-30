import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, readJsonLimited, retryAfterSeconds } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/security";
import { requireSession } from "@/lib/session-guard";
import { deleteAccountSchema, firstZodError } from "@/lib/validation";

export async function DELETE(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const limited = await rateLimit(`account:${auth.session.user.id}:${clientKey(request)}`, 3, 60_000);
  if (!limited.ok) {
    return jsonError("Wait a moment", 429, { request, retryAfter: retryAfterSeconds(limited.retryAt) });
  }
  const raw = await readJsonLimited(request, 2_048);
  if (!raw.ok) return jsonError(raw.error, 400, { request });
  const parsed = deleteAccountSchema.safeParse(raw.data);
  if (!parsed.success) return jsonError(firstZodError(parsed.error), 400, { request });
  if (parsed.data.email !== auth.session.user.email) {
    return jsonError("Email does not match", 400, { request });
  }
  await writeAudit(auth.session.user.id, "account.delete", auth.session.user.email);
  await prisma.user.delete({ where: { id: auth.session.user.id } });
  return jsonOk({ ok: true }, { request });
}
