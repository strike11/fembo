import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { ollamaComplete } from "@/lib/ollama-complete";
import { getSession } from "@/lib/session";
import { stripEmotionMarkup } from "@/lib/emotions";

export default async function RecapPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [messages, calls, gifts, journal, letters, rituals, snippets] = await Promise.all([
    prisma.message.count({
      where: { conversation: { userId: session.user.id }, createdAt: { gte: since } },
    }),
    prisma.callSession.count({ where: { userId: session.user.id, startedAt: { gte: since } } }),
    prisma.gift.count({ where: { userId: session.user.id, createdAt: { gte: since } } }),
    prisma.journalEntry.count({ where: { userId: session.user.id, createdAt: { gte: since } } }),
    prisma.letter.count({ where: { userId: session.user.id, createdAt: { gte: since } } }),
    prisma.ritualDone.count({ where: { userId: session.user.id, createdAt: { gte: since } } }),
    prisma.message.findMany({
      where: { conversation: { userId: session.user.id }, role: "assistant", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { content: true },
    }),
  ]);

  const story =
    (await ollamaComplete(
      "You write a private weekly recap as if a companion noticed the week. 5 to 8 warm adult sentences. No lists. No markdown.",
      `Counts this week: ${messages} messages, ${calls} calls, ${gifts} gifts, ${journal} journal, ${letters} letters, ${rituals} rituals. Recent lines:\n${snippets
        .map((item) => stripEmotionMarkup(item.content).slice(0, 140))
        .join("\n")}`,
    )) ?? "The room kept the week. Come back when you want it said out loud.";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Recap" title="The last seven days">
        <p>Not just a count. How the house felt.</p>
      </PageIntro>
      <Card>
        <CardHeader>
          <CardDescription>From the room</CardDescription>
          <CardTitle className="text-lg font-normal leading-8">{story}</CardTitle>
        </CardHeader>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Messages", value: messages, href: "/app/companions" },
          { label: "Calls", value: calls, href: "/app/calls" },
          { label: "Gifts", value: gifts, href: "/app/explore" },
          { label: "Check-ins", value: journal, href: "/app/journal" },
          { label: "Letters", value: letters, href: "/app/letters" },
          { label: "Rituals", value: rituals, href: "/app/rituals" },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <Card size="sm">
              <CardHeader>
                <CardDescription>{item.label}</CardDescription>
                <CardTitle className="text-3xl">{item.value}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
