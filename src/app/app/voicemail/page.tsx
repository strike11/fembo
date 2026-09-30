import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { buttonVariants } from "@/components/ui/button";
import { COMPANION_PRESETS } from "@/lib/companions";
import { prisma } from "@/lib/db";
import { formatRelative } from "@/lib/format";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function VoicemailPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const voicemails = await prisma.voicemail.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  if (voicemails.some((item) => !item.read)) {
    await prisma.voicemail.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true },
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Voicemail" title="What they left after the call">
        <p>The last spoken line becomes a note you can open later.</p>
      </PageIntro>
      <div className="flex flex-col gap-2">
        {voicemails.length === 0 ? (
          <p className="text-sm text-muted-foreground">No voicemail yet. Hang up a call and it will land here.</p>
        ) : (
          voicemails.map((item) => {
            const companion = COMPANION_PRESETS.find((entry) => entry.slug === item.slug);
            return (
              <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
                <p className="text-xs text-muted-foreground">
                  {companion?.name ?? item.slug} · {formatRelative(item.createdAt)}
                </p>
                <p className="mt-1 text-sm leading-6">{item.body}</p>
                <Link href={`/app/call/${item.slug}`} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-2")}>
                  Call back
                </Link>
              </article>
            );
          })
        )}
      </div>
    </main>
  );
}
