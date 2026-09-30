import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { formatRelative } from "@/lib/format";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function ActivityPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [messages, calls, letters, gifts, journal] = await Promise.all([
    prisma.message.findMany({
      where: { conversation: { userId: session.user.id }, role: "user" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { conversation: { include: { config: { include: { preset: true } } } } },
    }),
    prisma.callSession.findMany({
      where: { userId: session.user.id },
      orderBy: { startedAt: "desc" },
      take: 8,
    }),
    prisma.letter.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.gift.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.journalEntry.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const items = [
    ...messages.map((item) => ({
      id: `msg-${item.id}`,
      title: `You wrote to ${item.conversation.config.nickname}`,
      href: `/app/companions/${item.conversation.config.preset.slug}`,
      at: item.createdAt,
    })),
    ...calls.map((item) => ({
      id: `call-${item.id}`,
      title: "A voice call",
      href: "/app/calls",
      at: item.startedAt,
    })),
    ...letters.map((item) => ({
      id: `letter-${item.id}`,
      title: item.title,
      href: "/app/letters",
      at: item.createdAt,
    })),
    ...gifts.map((item) => ({
      id: `gift-${item.id}`,
      title: `You sent ${item.kind}`,
      href: `/app/companions/${item.slug}`,
      at: item.createdAt,
    })),
    ...journal.map((item) => ({
      id: `journal-${item.id}`,
      title: `Check-in · ${item.mood}`,
      href: "/app/journal",
      at: item.createdAt,
    })),
  ]
    .sort((left, right) => right.at.getTime() - left.at.getTime())
    .slice(0, 30);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Activity" title="What the room has been doing">
        <p>Chats, calls, gifts, letters, and check-ins in one quiet list.</p>
      </PageIntro>
      <div className="flex flex-col gap-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing yet. Say hi or leave a check-in.</p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-border"
            >
              <span className="text-sm">{item.title}</span>
              <span className="text-xs text-muted-foreground">{formatRelative(item.at)}</span>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
