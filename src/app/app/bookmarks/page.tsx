import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { COMPANION_PRESETS } from "@/lib/companions";
import { prisma } from "@/lib/db";
import { formatRelative } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function BookmarksPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Bookmarks" title="Lines you wanted to keep">
        <p>Save a sentence from chat and it lands here.</p>
      </PageIntro>
      <div className="flex flex-col gap-2">
        {bookmarks.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing saved yet. Hover a message and bookmark it.</p>
        ) : (
          bookmarks.map((item) => {
            const companion = COMPANION_PRESETS.find((entry) => entry.slug === item.slug);
            return (
              <Link
                key={item.id}
                href={`/app/companions/${item.slug}`}
                className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border"
              >
                <p className="text-xs text-muted-foreground">
                  {companion?.name ?? item.slug} · {formatRelative(item.createdAt)}
                </p>
                <p className="mt-1 text-sm">{item.snippet}</p>
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
}
