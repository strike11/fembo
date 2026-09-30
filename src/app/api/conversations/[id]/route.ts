import { prisma } from "@/lib/db";
import { isSameOrigin } from "@/lib/security";
import { SCENE_IDS } from "@/lib/scenes";
import { getSession } from "@/lib/session";
import { z } from "zod";

const patchSchema = z.object({
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
  title: z.string().trim().min(1).max(80).optional(),
  scene: z.enum(SCENE_IDS).optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const { id } = await context.params;
  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: session.user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      config: { include: { preset: true } },
    },
  });
  if (!conversation) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({
    conversation: {
      id: conversation.id,
      title: conversation.title,
      pinned: conversation.pinned,
      archived: conversation.archived,
      slug: conversation.config.preset.slug,
      messages: conversation.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
      })),
    },
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const { id } = await context.params;
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid update" }, { status: 400 });

  const existing = await prisma.conversation.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const conversation = await prisma.conversation.update({
    where: { id },
    data: parsed.data,
  });
  return Response.json({ conversation });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const { id } = await context.params;
  await prisma.conversation.deleteMany({ where: { id, userId: session.user.id } });
  return Response.json({ ok: true });
}
