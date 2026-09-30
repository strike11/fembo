import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, idSchema, lineSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const boundaries = await prisma.boundary.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return Response.json({ boundaries });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = lineSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const boundary = await prisma.boundary.create({
    data: { userId: auth.session.user.id, content: parsed.data.content },
  });
  return Response.json({ boundary });
}

export async function DELETE(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = idSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  await prisma.boundary.deleteMany({
    where: { id: parsed.data.id, userId: auth.session.user.id },
  });
  return Response.json({ ok: true });
}
