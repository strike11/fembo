import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, idSchema, promiseSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const promises = await prisma.promiseItem.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return Response.json({ promises });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = promiseSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const item = await prisma.promiseItem.create({
    data: { userId: auth.session.user.id, ...parsed.data },
  });
  return Response.json({ promise: item });
}

export async function PATCH(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = idSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const current = await prisma.promiseItem.findFirst({
    where: { id: parsed.data.id, userId: auth.session.user.id },
  });
  if (!current) return Response.json({ error: "Not found" }, { status: 404 });
  const promise = await prisma.promiseItem.update({
    where: { id: current.id },
    data: { done: !current.done },
  });
  return Response.json({ promise });
}

export async function DELETE(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = idSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  await prisma.promiseItem.deleteMany({
    where: { id: parsed.data.id, userId: auth.session.user.id },
  });
  return Response.json({ ok: true });
}
