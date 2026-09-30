import { after } from "next/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  ensureDailyDreams,
  ensureDailyFortunes,
  ensureDailyLetters,
  ensureDailyLook,
  ensureMorningLine,
  openDueCapsules,
  unlockAchievements,
  welcomeIfNeeded,
} from "@/lib/companion-service";
import { ensureUserSettings } from "@/lib/companion-service";
import { houseExtrasEnabled } from "@/lib/env";
import { listRecents } from "@/lib/platform";
import { getSession } from "@/lib/session";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const userId = session.user.id;
  after(() => {
    void Promise.all([
      welcomeIfNeeded(userId, session.user.name),
      ensureMorningLine(userId),
      ensureDailyLetters(userId),
      ensureDailyDreams(userId),
      ensureDailyFortunes(userId),
      ensureDailyLook(userId),
      openDueCapsules(userId),
      unlockAchievements(userId),
    ]);
  });

  const [recents, settings] = await Promise.all([
    listRecents(userId, 10),
    ensureUserSettings(userId),
  ]);

  return (
    <AppShell
      name={session.user.name}
      recents={recents}
      locale={settings.locale}
      houseExtras={houseExtrasEnabled()}
    >
      {children}
    </AppShell>
  );
}
