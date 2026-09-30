import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { RemindersBoard } from "@/components/reminders-board";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function RemindersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const reminders = await prisma.reminder.findMany({
    where: { userId: session.user.id },
    orderBy: [{ done: "asc" }, { createdAt: "desc" }],
    take: 40,
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Reminders" title="Little things they can hold">
        <p>Not a calendar. Just “tonight”, “later”, “after the call”.</p>
      </PageIntro>
      <RemindersBoard initial={reminders} />
    </main>
  );
}
