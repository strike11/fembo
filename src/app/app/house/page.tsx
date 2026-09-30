import { BellIcon, BookOpenIcon, MailIcon, MoonStarIcon } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { ensureUserSettings } from "@/lib/companion-service";
import { houseExtrasEnabled } from "@/lib/env";
import { asLocale, t } from "@/lib/i18n";
import { getSession } from "@/lib/session";

const ITEMS = [
  {
    href: "/app/journal",
    icon: BookOpenIcon,
    titleKey: "houseJournal" as const,
  },
  {
    href: "/app/letters",
    icon: MailIcon,
    titleKey: "houseLetters" as const,
  },
  {
    href: "/app/rituals",
    icon: MoonStarIcon,
    titleKey: "houseRituals" as const,
  },
  {
    href: "/app/reminders",
    icon: BellIcon,
    titleKey: "houseReminders" as const,
  },
] as const;

export default async function HousePage() {
  if (!houseExtrasEnabled()) notFound();

  const session = await getSession();
  if (!session) redirect("/login");

  const settings = await ensureUserSettings(session.user.id);
  const lang = asLocale(settings.locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8 pb-24 md:pb-8">
      <PageIntro eyebrow={t(lang, "houseEyebrow")} title={t(lang, "houseTitle")}>
        <p>{t(lang, "houseHint")}</p>
      </PageIntro>
      <div className="grid gap-3 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-2xl bg-card px-4 py-4 ring-1 ring-border hover:bg-muted motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <item.icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <p className="font-medium">{t(lang, item.titleKey)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
