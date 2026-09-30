import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { COMPANION_PRESETS } from "@/lib/companions";
import { prisma } from "@/lib/db";
import { formatRelative } from "@/lib/format";
import { giftById } from "@/lib/gifts";
import { getSession } from "@/lib/session";

export default async function ShelfPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const gifts = await prisma.gift.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  const grouped = COMPANION_PRESETS.map((companion) => ({
    companion,
    items: gifts.filter((gift) => gift.slug === companion.slug),
  })).filter((row) => row.items.length > 0);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Shelf" title="What you have given">
        <p>A quiet shelf of tea, stars, and the rest. They remember these.</p>
      </PageIntro>
      {grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No gifts yet. Open a chat and leave something on the table.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(({ companion, items }) => (
            <section key={companion.slug} className="rounded-2xl bg-card p-4 ring-1 ring-border">
              <Link href={`/app/companions/${companion.slug}`} className="flex items-center gap-3">
                <Image
                  src={companion.avatarPath}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{companion.name}</p>
                  <p className="text-xs text-muted-foreground">{items.length} on the shelf</p>
                </div>
              </Link>
              <div className="mt-3 flex flex-wrap gap-2">
                {items.map((gift) => {
                  const def = giftById(gift.kind);
                  return (
                    <span
                      key={gift.id}
                      className="rounded-full bg-muted px-2.5 py-1 text-xs"
                      title={formatRelative(gift.createdAt)}
                    >
                      {def?.emoji ?? "•"} {def?.label ?? gift.kind}
                    </span>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
