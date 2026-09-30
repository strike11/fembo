import { redirect } from "next/navigation";
import { DatesBoard } from "@/components/dates-board";
import { PageIntro } from "@/components/page-intro";
import { COMPANION_PRESETS } from "@/lib/companions";
import { prisma } from "@/lib/db";
import { daysBetween } from "@/lib/keeps";
import { getSession } from "@/lib/session";

export default async function DatesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [plans, firsts] = await Promise.all([
    prisma.datePlan.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    Promise.all(
      COMPANION_PRESETS.map(async (companion) => {
        const first = await prisma.message.findFirst({
          where: { conversation: { userId: session.user.id, config: { preset: { slug: companion.slug } } } },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        });
        return {
          slug: companion.slug,
          name: companion.name,
          firstAt: first?.createdAt.toISOString() ?? null,
          days: first ? daysBetween(first.createdAt) : 0,
        };
      }),
    ),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Dates" title="Nights you put on the table">
        <p>First-meet days stay even if you never plan another. Plans are optional, and nicer.</p>
      </PageIntro>
      <section className="flex flex-col gap-2">
        {firsts
          .filter((row) => row.firstAt)
          .map((row) => (
            <div key={row.slug} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
              <p className="text-sm font-medium">{row.name}</p>
              <p className="text-sm text-muted-foreground">
                First chat {row.days} day{row.days === 1 ? "" : "s"} ago
              </p>
            </div>
          ))}
      </section>
      <DatesBoard
        initial={plans.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
