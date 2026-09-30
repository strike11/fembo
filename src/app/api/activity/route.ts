import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });

  const [messages, calls, letters, gifts, journal] = await Promise.all([
    prisma.message.findMany({
      where: { conversation: { userId: session.user.id }, role: "user" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { conversation: { include: { config: { include: { preset: true } } } } },
    }),
    prisma.callSession.findMany({
      where: { userId: session.user.id },
      orderBy: { startedAt: "desc" },
      take: 6,
    }),
    prisma.letter.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.gift.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.journalEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const items = [
    ...messages.map((item) => ({
      id: `msg-${item.id}`,
      kind: "chat" as const,
      title: `Chat with ${item.conversation.config.nickname}`,
      body: item.content.slice(0, 120),
      href: `/app/companions/${item.conversation.config.preset.slug}`,
      at: item.createdAt.toISOString(),
    })),
    ...calls.map((item) => ({
      id: `call-${item.id}`,
      kind: "call" as const,
      title: "Voice call",
      body: item.summary || "A call landed here.",
      href: "/app/calls",
      at: item.startedAt.toISOString(),
    })),
    ...letters.map((item) => ({
      id: `letter-${item.id}`,
      kind: "letter" as const,
      title: item.title,
      body: item.body.slice(0, 120),
      href: "/app/letters",
      at: item.createdAt.toISOString(),
    })),
    ...gifts.map((item) => ({
      id: `gift-${item.id}`,
      kind: "gift" as const,
      title: `Gift · ${item.kind}`,
      body: `Left for ${item.slug}`,
      href: `/app/companions/${item.slug}`,
      at: item.createdAt.toISOString(),
    })),
    ...journal.map((item) => ({
      id: `journal-${item.id}`,
      kind: "journal" as const,
      title: `Check-in · ${item.mood}`,
      body: item.content.slice(0, 120),
      href: "/app/journal",
      at: item.createdAt.toISOString(),
    })),
  ]
    .sort((left, right) => right.at.localeCompare(left.at))
    .slice(0, 24);

  return Response.json({ items });
}
