import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { dayKey } from "@/lib/daily";
import { prisma } from "@/lib/db";
import { shiftDay } from "@/lib/keeps";
import { getSession } from "@/lib/session";

function lastDays(count: number) {
  const today = dayKey();
  return Array.from({ length: count }, (_, index) => shiftDay(today, -(count - 1 - index)));
}

export default async function CalendarPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const since = new Date();
  since.setDate(since.getDate() - 27);
  const [messages, journals] = await Promise.all([
    prisma.message.findMany({
      where: { conversation: { userId: session.user.id }, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.journalEntry.findMany({
      where: { userId: session.user.id, createdAt: { gte: since } },
      select: { createdAt: true, mood: true },
    }),
  ]);
  const counts = new Map<string, number>();
  for (const item of messages) {
    const key = dayKey(item.createdAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const moods = new Map<string, string>();
  for (const item of journals) {
    moods.set(dayKey(item.createdAt), item.mood);
  }
  const days = lastDays(28);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Calendar" title="Twenty-eight quiet days">
        <p>Darker squares mean more talk. Moods from the journal sit on top when you left one.</p>
      </PageIntro>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const count = counts.get(day) ?? 0;
          const heat = count === 0 ? "bg-muted" : count < 4 ? "bg-primary/30" : count < 10 ? "bg-primary/60" : "bg-primary";
          return (
            <div key={day} className={`min-h-16 rounded-xl p-2 text-xs ${heat}`} title={`${day}: ${count} messages`}>
              <p className={count >= 10 ? "text-primary-foreground" : "text-foreground"}>{day.slice(8)}</p>
              <p className={`mt-1 ${count >= 10 ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {moods.get(day) ?? (count ? `${count}` : "·")}
              </p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
