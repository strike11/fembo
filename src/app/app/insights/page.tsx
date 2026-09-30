import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { bondFromCounts, streakFromDates } from "@/lib/bond";
import { COMPANION_PRESETS } from "@/lib/companions";
import { prisma } from "@/lib/db";
import { companionBond, getHomeStats } from "@/lib/platform";
import { getSession } from "@/lib/session";

export default async function InsightsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [stats, dates, rows] = await Promise.all([
    getHomeStats(session.user.id),
    prisma.message.findMany({
      where: { conversation: { userId: session.user.id } },
      select: { createdAt: true },
      take: 300,
    }),
    Promise.all(
      COMPANION_PRESETS.map(async (companion) => {
        const counts = await companionBond(session.user.id, companion.slug);
        return { companion, counts, bond: bondFromCounts(counts) };
      }),
    ),
  ]);
  const streak = streakFromDates(dates.map((item) => item.createdAt));
  const active = rows.filter((row) => row.counts.messages + row.counts.calls + row.counts.gifts > 0);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Insights" title="How close the room has become">
        <p>Counts, streaks, and a bond read for each companion you have sat with.</p>
      </PageIntro>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Messages", value: stats.messages },
          { label: "Calls", value: stats.calls },
          { label: "Day streak", value: streak },
          { label: "Gifts", value: stats.gifts },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="font-heading text-2xl font-semibold">{item.value}</p>
          </div>
        ))}
      </section>
      <section className="flex flex-col gap-2">
        {(active.length > 0 ? active : rows).map(({ companion, bond, counts }) => (
          <Link
            key={companion.slug}
            href={`/app/companions/${companion.slug}/profile`}
            className="flex items-center gap-3 rounded-2xl bg-card px-3 py-3 ring-1 ring-border hover:bg-muted"
          >
            <Image
              src={companion.avatarPath}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {companion.name} · {bond.label}
              </p>
              <p className="text-xs text-muted-foreground">{bond.hint}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${bond.score}%` }} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {counts.messages}m · {counts.calls}c
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
