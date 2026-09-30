import { prisma } from "@/lib/db";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  }
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const { id } = await context.params;
  const body = (await request.json()) as { summary?: string };
  const call = await prisma.callSession.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!call) return Response.json({ error: "Call not found" }, { status: 404 });

  const endedAt = new Date();
  const durationSec = Math.max(0, Math.round((endedAt.getTime() - call.startedAt.getTime()) / 1000));
  const updated = await prisma.callSession.update({
    where: { id },
    data: {
      endedAt,
      durationSec,
      summary: (body.summary ?? "").slice(0, 400),
    },
  });
  const leftover = (body.summary ?? "").trim();
  if (leftover) {
    await prisma.voicemail.create({
      data: {
        userId: session.user.id,
        slug: call.slug,
        body: leftover.slice(0, 400),
      },
    });
  }
  await prisma.notification.create({
    data: {
      userId: session.user.id,
      title: "Call ended",
      body: leftover
        ? "They left a voicemail from the last line."
        : `The call lasted ${Math.floor(durationSec / 60)}m ${durationSec % 60}s.`,
      href: leftover ? "/app/voicemail" : "/app/calls",
    },
  });
  return Response.json({ call: updated });
}
