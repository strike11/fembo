import { CompassIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HomeQuotaStatus } from "@/components/home-quota-status";
import { OnboardingCard } from "@/components/onboarding-card";
import { PageIntro } from "@/components/page-intro";
import { buttonVariants } from "@/components/ui/button";
import { ensureUserSettings } from "@/lib/companion-service";
import { formatRelative } from "@/lib/format";
import { greeting, asLocale, t, tf } from "@/lib/i18n";
import { listRecents } from "@/lib/platform";
import { getQuota } from "@/lib/quota";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [recents, settings, quota, messageCount, conversationCount] = await Promise.all([
    listRecents(session.user.id, 6),
    ensureUserSettings(session.user.id),
    getQuota(session.user.id),
    prisma.message.count({
      where: { conversation: { userId: session.user.id } },
    }),
    prisma.conversation.count({
      where: { userId: session.user.id, archived: false },
    }),
  ]);

  const lang = asLocale(settings.locale);
  const continueChat = recents[0];
  const hour = new Date().getHours();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8 pb-24 md:pb-8">
      <PageIntro eyebrow={t(lang, "homeEyebrow")} title={`${greeting(lang, hour)}, ${session.user.name}`}>
        <p>{t(lang, "homeTagline")}</p>
      </PageIntro>

      <section className="flex flex-col gap-4">
        {continueChat ? (
          <Link
            href={`/app/companions/${continueChat.slug}`}
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-auto min-h-14 flex-col items-start gap-2 rounded-2xl px-5 py-4 text-left motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <span className="text-xs font-normal opacity-80">{t(lang, "continue")}</span>
            <span className="text-lg font-semibold">
              {tf(lang, "continueWith", { name: continueChat.name })}
            </span>
            <span className="truncate text-sm font-normal opacity-80">{continueChat.preview}</span>
          </Link>
        ) : (
          <Link
            href="/app/explore"
            className={cn(buttonVariants({ size: "lg" }), "min-h-14 rounded-2xl motion-reduce:transition-none")}
          >
            {t(lang, "meetSomeone")}
          </Link>
        )}

        <HomeQuotaStatus quota={quota} locale={lang} />
      </section>

      <OnboardingCard
        locale={lang}
        steps={[
          { label: t(lang, "onboardingAccount"), done: true },
          {
            label: t(lang, "onboardingCompanion"),
            href: "/app/explore",
            done: conversationCount > 0,
          },
          {
            label: t(lang, "onboardingFirstReply"),
            href: continueChat ? `/app/companions/${continueChat.slug}` : "/app/explore",
            done: messageCount > 0,
          },
        ]}
      />

      {continueChat ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            {t(lang, "lastCompanion")}
          </h2>
          <Link
            href={`/app/companions/${continueChat.slug}`}
            className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-border hover:bg-muted motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image
              src={continueChat.avatarPath}
              alt=""
              width={48}
              height={48}
              className="size-12 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{continueChat.name}</p>
              <p className="truncate text-sm text-muted-foreground">{continueChat.preview}</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatRelative(continueChat.updatedAt)}
            </span>
          </Link>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/app/explore"
          className="flex items-center gap-3 rounded-2xl bg-card px-4 py-4 ring-1 ring-border hover:bg-muted motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <CompassIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <p className="font-medium">{t(lang, "exploreCompanions")}</p>
            <p className="text-sm text-muted-foreground">{t(lang, "navExplore")}</p>
          </div>
        </Link>
        <Link
          href="/app/create"
          className="flex items-center gap-3 rounded-2xl bg-card px-4 py-4 ring-1 ring-border hover:bg-muted motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <PlusIcon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <p className="font-medium">{t(lang, "createYours")}</p>
            <p className="text-sm text-muted-foreground">{t(lang, "create")}</p>
          </div>
        </Link>
      </section>
    </main>
  );
}
