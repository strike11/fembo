import { redirect } from "next/navigation";
import { MemoriesBoard } from "@/components/memories-board";
import { PageIntro } from "@/components/page-intro";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function MemoriesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const memories = await prisma.memory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Memories" title="Things they should not forget">
        <p>
          Facts you pin here, or say with “remember …”, stay with that companion on chat and on
          calls.
        </p>
      </PageIntro>
      <MemoriesBoard
        initial={memories.map((memory) => ({
          id: memory.id,
          slug: memory.slug,
          content: memory.content,
          createdAt: memory.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
