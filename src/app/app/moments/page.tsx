import { redirect } from "next/navigation";
import { MomentsBoard } from "@/components/moments-board";
import { PageIntro } from "@/components/page-intro";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function MomentsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const moments = await prisma.moment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Moments" title="A quiet album">
        <p>Keep a scene from the room — not a photo, a sentence you do not want to lose.</p>
      </PageIntro>
      <MomentsBoard
        initial={moments.map((item) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
