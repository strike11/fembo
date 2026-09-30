import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { prisma } from "@/lib/db";
import { formatRelative } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function SummariesPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const summaries = await prisma.threadSummary.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Summaries" title="Threads, folded">
        <p>From chat, ask for a summary. It lands here so you do not have to reread the whole night.</p>
      </PageIntro>
      {summaries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No folds yet. Open a chat and tap Summarize.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {summaries.map((item) => (
            <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
              <p className="text-xs text-muted-foreground">
                {item.slug} · {formatRelative(item.createdAt)}
              </p>
              <p className="mt-1 text-sm leading-7">{item.body}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
