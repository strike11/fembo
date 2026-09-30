import { prisma } from "@/lib/db";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";
import { firstZodError, reminderSchema } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const reminders = await prisma.reminder.findMany({
    where: { userId: session.user.id },
    orderBy: [{ done: "asc" }, { createdAt: "desc" }],
    take: 40,
  });
  return Response.json({ reminders });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const parsed = reminderSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const reminder = await prisma.reminder.create({
    data: { userId: session.user.id, ...parsed.data },
  });
  return Response.json({ reminder });
}

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const body = (await request.json()) as { id?: string; done?: boolean };
  if (!body.id) return Response.json({ error: "Missing id" }, { status: 400 });
  await prisma.reminder.updateMany({
    where: { id: body.id, userId: session.user.id },
    data: { done: body.done ?? true },
  });
  return Response.json({ ok: true });
}
