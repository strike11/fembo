import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { unlockAchievements } from "@/lib/companion-service";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function AchievementsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  await unlockAchievements(session.user.id);
  const unlocked = await prisma.achievement.findMany({
    where: { userId: session.user.id },
  });
  const have = new Set(unlocked.map((item) => item.key));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Achievements" title="Marks the room keeps">
        <p>Small proofs you have been here. Nothing loud.</p>
      </PageIntro>
      <div className="grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((item) => {
          const on = have.has(item.key);
          return (
            <div
              key={item.key}
              className={`rounded-2xl px-4 py-3 ring-1 ${on ? "bg-card ring-border" : "bg-muted/40 ring-transparent opacity-60"}`}
            >
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-sm text-muted-foreground">{item.hint}</p>
              <p className="mt-2 text-xs text-muted-foreground">{on ? "Unlocked" : "Still waiting"}</p>
            </div>
          );
        })}
      </div>
    </main>
  );
}
