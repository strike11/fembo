import { ensureCompanionConfig } from "@/lib/companion-service";
import { prisma } from "@/lib/db";
import { listRecents } from "@/lib/platform";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";
import { firstZodError, slugSchema } from "@/lib/validation";
import { z } from "zod";

const schema = z.object({ slug: slugSchema });

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const slug = new URL(request.url).searchParams.get("slug") ?? undefined;
  const archived = new URL(request.url).searchParams.get("archived") === "1";

  if (slug) {
    const conversations = await prisma.conversation.findMany({
      where: {
        userId: session.user.id,
        archived,
        config: { preset: { slug } },
      },
      orderBy: [{ pinned: "desc" }, { lastMessageAt: "desc" }],
      take: 24,
      select: {
        id: true,
        title: true,
        pinned: true,
        archived: true,
        lastMessageAt: true,
      },
    });
    return Response.json({ conversations });
  }

  const conversations = await listRecents(session.user.id, 20);
  return Response.json({ conversations });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });

  const ensured = await ensureCompanionConfig(session.user.id, parsed.data.slug);
  if (!ensured) return Response.json({ error: "Companion not found" }, { status: 404 });

  await prisma.conversation.updateMany({
    where: { configId: ensured.config.id, archived: false },
    data: { archived: true },
  });
  const conversation = await prisma.conversation.create({
    data: { userId: session.user.id, configId: ensured.config.id, title: "New chat" },
  });
  return Response.json({ conversationId: conversation.id });
}
