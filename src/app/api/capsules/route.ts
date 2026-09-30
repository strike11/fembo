import { ensureCompanionConfig, openDueCapsules } from "@/lib/companion-service";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session-guard";
import { capsuleSchema, firstZodError, idSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  await openDueCapsules(auth.session.user.id);
  const capsules = await prisma.timeCapsule.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return Response.json({ capsules });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = capsuleSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const ensured = await ensureCompanionConfig(auth.session.user.id, parsed.data.slug);
  if (!ensured) return Response.json({ error: "Companion not found" }, { status: 404 });
  const capsule = await prisma.timeCapsule.create({
    data: { userId: auth.session.user.id, ...parsed.data },
  });
  return Response.json({ capsule });
}

export async function DELETE(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = idSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  await prisma.timeCapsule.deleteMany({
    where: { id: parsed.data.id, userId: auth.session.user.id },
  });
  return Response.json({ ok: true });
}
