import { redirect } from "next/navigation";
import { JournalBoard } from "@/components/journal-board";
import { PageIntro } from "@/components/page-intro";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function JournalPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const entries = await prisma.journalEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Journal" title="How the day is sitting">
        <p>Leave a check-in. Someone in the room answers in a small voice, then it stays here.</p>
      </PageIntro>
      <JournalBoard
        initial={entries.map((entry) => ({
          id: entry.id,
          mood: entry.mood,
          content: entry.content,
          reply: entry.reply,
          slug: entry.slug,
          createdAt: entry.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
