import { after } from "next/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ensureUserSettings, welcomeIfNeeded } from "@/lib/companion-service";
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
    void welcomeIfNeeded(userId, session.user.name);
  });

  const [recents, settings] = await Promise.all([
    listRecents(userId, 10),
    ensureUserSettings(userId),
  ]);

  return (
    <AppShell name={session.user.name} recents={recents} locale={settings.locale}>
      {children}
    </AppShell>
  );
}
