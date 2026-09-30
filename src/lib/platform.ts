import { prisma } from "@/lib/db";
import { formatPreview } from "@/lib/format";
import { resolveAssetUrl } from "@/lib/storage";

export async function listRecents(userId: string, take = 12) {
  const conversations = await prisma.conversation.findMany({
    where: { userId, archived: false },
    orderBy: [{ pinned: "desc" }, { lastMessageAt: "desc" }],
    take,
    include: {
      config: {
        include: { preset: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, role: true },
      },
    },
  });

  return conversations.map((conversation) => ({
    id: conversation.id,
    slug: conversation.config.preset.slug,
    name: conversation.config.nickname,
    avatarPath: resolveAssetUrl(conversation.config.preset.avatarPath),
    preview: formatPreview(conversation.messages[0]?.content ?? ""),
    pinned: conversation.pinned,
    updatedAt: conversation.lastMessageAt.toISOString(),
  }));
}

export async function getHomeStats(userId: string) {
  const [conversations, messages, calls, memories, favorites] = await Promise.all([
    prisma.conversation.count({ where: { userId, archived: false } }),
    prisma.message.count({ where: { conversation: { userId } } }),
    prisma.callSession.count({ where: { userId } }),
    prisma.memory.count({ where: { userId } }),
    prisma.favorite.count({ where: { userId } }),
  ]);
  const [letters, gifts, journal] = await Promise.all([
    prisma.letter.count({ where: { userId, read: false } }),
    prisma.gift.count({ where: { userId } }),
    prisma.journalEntry.count({ where: { userId } }),
  ]);
  return { conversations, messages, calls, memories, favorites, letters, gifts, journal };
}

export async function companionBond(userId: string, slug: string) {
  const [messages, calls, memories, gifts] = await Promise.all([
    prisma.message.count({
      where: { conversation: { userId, config: { preset: { slug } } } },
    }),
    prisma.callSession.count({ where: { userId, slug } }),
    prisma.memory.count({ where: { userId, slug } }),
    prisma.gift.count({ where: { userId, slug } }),
  ]);
  return { messages, calls, memories, gifts };
}

export function maybeMemoryFromMessage(content: string) {
  const patterns = [
    /(?:remember(?: that)?)\s*[:\-]?\s*(.+)$/i,
    /(?:call me)\s+(.+)$/i,
    /(?:my name is)\s+(.+)$/i,
    /(?:i (?:like|love|hate))\s+(.+)$/i,
    /(?:i don't like)\s+(.+)$/i,
  ];
  for (const pattern of patterns) {
    const match = content.match(pattern);
    const fact = match?.[1]?.trim().replace(/[.!?]+$/, "");
    if (fact && fact.length >= 3 && fact.length <= 240) return fact;
  }
  return null;
}

export async function rememberFact(userId: string, slug: string, content: string) {
  const fact = maybeMemoryFromMessage(content);
  if (!fact) return null;
  const exists = await prisma.memory.findFirst({
    where: { userId, slug, content: fact },
    select: { id: true },
  });
  if (exists) return null;
  return prisma.memory.create({
    data: { userId, slug, content: fact },
  });
}
