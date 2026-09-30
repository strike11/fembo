import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, idSchema, taskSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const tasks = await prisma.careTask.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return Response.json({ tasks });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = taskSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const task = await prisma.careTask.create({
    data: { userId: auth.session.user.id, ...parsed.data },
  });
  return Response.json({ task });
}

export async function PATCH(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = idSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const current = await prisma.careTask.findFirst({
    where: { id: parsed.data.id, userId: auth.session.user.id },
  });
  if (!current) return Response.json({ error: "Not found" }, { status: 404 });
  const task = await prisma.careTask.update({
    where: { id: current.id },
    data: { done: !current.done },
  });
  return Response.json({ task });
}

export async function DELETE(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = idSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  await prisma.careTask.deleteMany({
    where: { id: parsed.data.id, userId: auth.session.user.id },
  });
  return Response.json({ ok: true });
}
