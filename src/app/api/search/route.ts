import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < 2) return Response.json({ results: [] });

  const messages = await prisma.message.findMany({
    where: {
      conversation: { userId: session.user.id },
      content: { contains: query },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      conversation: {
        include: { config: { include: { preset: true } } },
      },
    },
  });

  return Response.json({
    results: messages.map((message) => ({
      id: message.id,
      content: message.content.slice(0, 160),
      slug: message.conversation.config.preset.slug,
      name: message.conversation.config.nickname,
      createdAt: message.createdAt,
    })),
  });
}
