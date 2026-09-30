import { prisma } from "@/lib/db";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";
import { firstZodError, reactionSchema } from "@/lib/validation";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const { id } = await context.params;
  const message = await prisma.message.findFirst({
    where: { id, conversation: { userId: session.user.id } },
  });
  if (!message) return Response.json({ error: "Not found" }, { status: 404 });
  await prisma.message.delete({ where: { id } });
  return Response.json({ ok: true });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const parsed = reactionSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const { id } = await context.params;
  const message = await prisma.message.findFirst({
    where: { id, conversation: { userId: session.user.id } },
  });
  if (!message) return Response.json({ error: "Not found" }, { status: 404 });
  const updated = await prisma.message.update({
    where: { id },
    data: { reaction: parsed.data.reaction },
  });
  return Response.json({ message: updated });
}
