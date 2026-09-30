import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { COMPANION_PRESETS } from "@/lib/companions";
import { prisma } from "@/lib/db";
import { formatDuration, formatRelative } from "@/lib/format";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function CallsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const calls = await prisma.callSession.findMany({
    where: { userId: session.user.id },
    orderBy: { startedAt: "desc" },
    take: 40,
  });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <PageIntro eyebrow="Calls" title="Voice with someone who stays">
          <p>Live calls use the same memory and the same thread. Hang up whenever you want.</p>
        </PageIntro>
      </div>
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">Place a call</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {COMPANION_PRESETS.map((companion) => (
            <Link
              key={companion.slug}
              href={`/app/call/${companion.slug}`}
              className="group overflow-hidden rounded-2xl bg-card ring-1 ring-border"
            >
              <Image
                src={companion.avatarPath}
                alt=""
                width={360}
                height={360}
                className="aspect-square w-full object-cover transition-transform group-hover:scale-[1.03]"
              />
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium">{companion.name}</span>
                <span className="text-xs text-muted-foreground">Call</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold">History</h2>
        {calls.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyTitle>No calls yet</EmptyTitle>
              <EmptyDescription>Pick someone above and stay on the line.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-2">
            {calls.map((call) => {
              const companion = COMPANION_PRESETS.find((item) => item.slug === call.slug);
              return (
                <div
                  key={call.id}
                  className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-border"
                >
                  {companion ? (
                    <Image
                      src={companion.avatarPath}
                      alt=""
                      width={44}
                      height={44}
                      className="size-11 rounded-full object-cover"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{companion?.name ?? call.slug}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {call.summary || (call.endedAt ? "Call ended" : "In progress")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelative(call.startedAt)} · {formatDuration(call.durationSec)}
                    </p>
                  </div>
                  <Link
                    href={`/app/call/${call.slug}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Call again
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
