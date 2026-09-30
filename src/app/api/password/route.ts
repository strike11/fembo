import { auth } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { jsonError, jsonOk, readJsonLimited, retryAfterSeconds } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/security";
import { COMMON_PASSWORDS, firstZodError, passwordSchema } from "@/lib/validation";
import { requireSession } from "@/lib/session-guard";

export async function PATCH(request: Request) {
  const authz = await requireSession(request);
  if (!authz.session) return authz.response;
  const limited = await rateLimit(`password:${authz.session.user.id}:${clientKey(request)}`, 5, 15 * 60_000);
  if (!limited.ok) {
    return jsonError("Wait a moment", 429, { request, retryAfter: retryAfterSeconds(limited.retryAt) });
  }
  const raw = await readJsonLimited(request, 4_096);
  if (!raw.ok) return jsonError(raw.error, 400, { request });
  const parsed = passwordSchema.safeParse(raw.data);
  if (!parsed.success) return jsonError(firstZodError(parsed.error), 400, { request });
  if (COMMON_PASSWORDS.has(parsed.data.newPassword.toLowerCase())) {
    return jsonError("Choose a less common password", 400, { request });
  }
  try {
    await auth.api.changePassword({
      body: {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        revokeOtherSessions: true,
      },
      headers: request.headers,
    });
  } catch {
    return jsonError("Could not change password", 400, { request });
  }
  await writeAudit(authz.session.user.id, "password.change");
  return jsonOk({ ok: true }, { request });
}
