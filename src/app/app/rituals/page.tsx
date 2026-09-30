import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { RitualsBoard } from "@/components/rituals-board";
import { dayKey } from "@/lib/daily";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function RitualsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const done = await prisma.ritualDone.findMany({
    where: { userId: session.user.id, day: dayKey() },
    select: { key: true },
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Rituals" title="Small things you can do together">
        <p>Morning, tea, a walk, date night, goodnight. Each one opens the chat with a line already waiting.</p>
      </PageIntro>
      <RitualsBoard done={done.map((item) => item.key)} />
    </main>
  );
}
