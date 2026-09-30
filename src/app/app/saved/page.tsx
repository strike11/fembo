import { ArchiveIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { ensureUserSettings } from "@/lib/companion-service";
import { asLocale, t } from "@/lib/i18n";
import { getSession } from "@/lib/session";

const ITEMS = [
  {
    href: "/app/memories",
    icon: SparklesIcon,
    titleKey: "savedMemories" as const,
    hintKey: "savedMemoriesHint" as const,
  },
  {
    href: "/app/archive",
    icon: ArchiveIcon,
    titleKey: "savedArchive" as const,
    hintKey: "savedArchiveHint" as const,
  },
] as const;

export default async function SavedPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const settings = await ensureUserSettings(session.user.id);
  const lang = asLocale(settings.locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8 pb-24 md:pb-8">
      <PageIntro eyebrow={t(lang, "savedEyebrow")} title={t(lang, "savedTitle")}>
        <p>{t(lang, "savedHint")}</p>
      </PageIntro>
      <div className="grid gap-3 sm:grid-cols-2">
        {ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex gap-3 rounded-2xl bg-card px-4 py-4 ring-1 ring-border hover:bg-muted motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <item.icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <p className="font-medium">{t(lang, item.titleKey)}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t(lang, item.hintKey)}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
