import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, idSchema, quoteSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const quotes = await prisma.quoteClip.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return Response.json({ quotes });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = quoteSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const quote = await prisma.quoteClip.create({
    data: { userId: auth.session.user.id, ...parsed.data },
  });
  return Response.json({ quote });
}

export async function DELETE(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = idSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  await prisma.quoteClip.deleteMany({
    where: { id: parsed.data.id, userId: auth.session.user.id },
  });
  return Response.json({ ok: true });
}
