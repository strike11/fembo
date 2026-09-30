import { redirect } from "next/navigation";
import { LettersInbox } from "@/components/letters-inbox";
import { PageIntro } from "@/components/page-intro";
import { ensureDailyLetters } from "@/lib/companion-service";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function LettersPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  await ensureDailyLetters(session.user.id);
  const letters = await prisma.letter.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Letters" title="Notes they left for you">
        <p>A daily letter arrives if you have been talking. You can also ask for one.</p>
      </PageIntro>
      <LettersInbox
        initial={letters.map((letter) => ({
          id: letter.id,
          slug: letter.slug,
          title: letter.title,
          body: letter.body,
          read: letter.read,
          createdAt: letter.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
