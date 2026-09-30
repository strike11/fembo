import { writeAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { jsonError, noStoreHeaders, retryAfterSeconds } from "@/lib/http";
import { clientKey, rateLimit } from "@/lib/security";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return jsonError("Sign in first", 401, { request });
  const limited = await rateLimit(`export:${session.user.id}:${clientKey(request)}`, 4, 60_000);
  if (!limited.ok) {
    return jsonError("Export is cooling down", 429, {
      request,
      retryAfter: retryAfterSeconds(limited.retryAt),
    });
  }

  const userId = session.user.id;
  const [
    user,
    settings,
    conversations,
    memories,
    calls,
    letters,
    journal,
    gifts,
    notes,
    boundaries,
    feedback,
    reports,
    audits,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        createdAt: true,
        dateOfBirth: true,
        ageConfirmedAt: true,
        termsAcceptedAt: true,
        lastLoginAt: true,
      },
    }),
    prisma.userSettings.findUnique({ where: { userId } }),
    prisma.conversation.findMany({
      where: { userId },
      include: {
        config: { include: { preset: { select: { slug: true, name: true } } } },
        messages: { orderBy: { createdAt: "asc" }, select: { role: true, content: true, createdAt: true } },
      },
    }),
    prisma.memory.findMany({ where: { userId } }),
    prisma.callSession.findMany({ where: { userId } }),
    prisma.letter.findMany({ where: { userId } }),
    prisma.journalEntry.findMany({ where: { userId } }),
    prisma.gift.findMany({ where: { userId } }),
    prisma.privateNote.findMany({ where: { userId } }),
    prisma.boundary.findMany({ where: { userId } }),
    prisma.feedback.findMany({ where: { userId } }),
    prisma.messageReport.findMany({ where: { userId } }),
    prisma.auditLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);

  await writeAudit(userId, "export.download");

  return Response.json(
    {
      exportedAt: new Date().toISOString(),
      user,
      settings,
      conversations: conversations.map((item) => ({
        companion: item.config.preset.name,
        slug: item.config.preset.slug,
        title: item.title,
        scene: item.scene,
        archived: item.archived,
        messages: item.messages,
      })),
      memories,
      calls,
      letters,
      journal,
      gifts,
      notes,
      boundaries,
      feedback,
      reports,
      audits,
    },
    { headers: noStoreHeaders(request) },
  );
}
