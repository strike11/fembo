import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, readJsonLimited } from "@/lib/http";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, idSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const sessions = await prisma.session.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      expiresAt: true,
      ipAddress: true,
      userAgent: true,
    },
  });
  return jsonOk(
    {
      currentId: auth.session.session.id,
      sessions,
    },
    { request },
  );
}

export async function DELETE(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const raw = await readJsonLimited(request, 2_048);
  if (!raw.ok) return jsonError(raw.error, 400, { request });
  const body = raw.data as { id?: string; others?: boolean };
  if (body.others) {
    await prisma.session.deleteMany({
      where: { userId: auth.session.user.id, id: { not: auth.session.session.id } },
    });
    await writeAudit(auth.session.user.id, "sessions.revoke_others");
    return jsonOk({ ok: true }, { request });
  }
  const parsed = idSchema.safeParse(body);
  if (!parsed.success) return jsonError(firstZodError(parsed.error), 400, { request });
  if (parsed.data.id === auth.session.session.id) {
    return jsonError("You cannot revoke this session here", 400, { request });
  }
  await prisma.session.deleteMany({
    where: { id: parsed.data.id, userId: auth.session.user.id },
  });
  await writeAudit(auth.session.user.id, "sessions.revoke", parsed.data.id);
  return jsonOk({ ok: true }, { request });
}
