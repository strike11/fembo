import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { buttonVariants } from "@/components/ui/button";
import { COMPANION_PRESETS } from "@/lib/companions";
import { companionMood, dayKey } from "@/lib/daily";
import { prisma } from "@/lib/db";
import { formatRelative } from "@/lib/format";
import { listRecents } from "@/lib/platform";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function StatusPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [recents, unreadLetters, unreadMail, openReminders, ritualsToday] = await Promise.all([
    listRecents(session.user.id, 5),
    prisma.letter.count({ where: { userId: session.user.id, read: false } }),
    prisma.voicemail.count({ where: { userId: session.user.id, read: false } }),
    prisma.reminder.count({ where: { userId: session.user.id, done: false } }),
    prisma.ritualDone.count({ where: { userId: session.user.id, day: dayKey() } }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Now" title="How the house is sitting">
        <p>Moods for today, open threads, and anything waiting for you.</p>
      </PageIntro>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Unread letters", value: unreadLetters, href: "/app/letters" },
          { label: "Voicemail", value: unreadMail, href: "/app/voicemail" },
          { label: "Open reminders", value: openReminders, href: "/app/reminders" },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="font-heading text-2xl font-semibold">{item.value}</p>
          </Link>
        ))}
      </section>

      <p className="text-sm text-muted-foreground">Rituals done today: {ritualsToday}</p>

      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold">Today’s moods</h2>
        {COMPANION_PRESETS.map((companion) => (
          <Link
            key={companion.slug}
            href={`/app/companions/${companion.slug}`}
            className="flex items-center gap-3 rounded-2xl bg-card px-3 py-2 ring-1 ring-border hover:bg-muted"
          >
            <Image
              src={companion.avatarPath}
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium">{companion.name}</p>
              <p className="truncate text-xs text-muted-foreground">{companionMood(companion.slug)}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Open threads</h2>
          <Link href="/app/companions" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            All chats
          </Link>
        </div>
        {recents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No threads yet.</p>
        ) : (
          recents.map((recent) => (
            <Link
              key={recent.id}
              href={`/app/companions/${recent.slug}`}
              className="flex items-center justify-between gap-3 rounded-2xl bg-card px-3 py-2 ring-1 ring-border"
            >
              <span className="truncate text-sm">{recent.name}</span>
              <span className="text-xs text-muted-foreground">{formatRelative(recent.updatedAt)}</span>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
