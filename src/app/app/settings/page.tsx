import { redirect } from "next/navigation";

import { AccountSecurity } from "@/components/account-security";

import { ExportRoom } from "@/components/export-room";

import { PageIntro } from "@/components/page-intro";

import { SettingsForm } from "@/components/settings-form";

import Link from "next/link";

import { ensureUserSettings } from "@/lib/companion-service";

import { prisma } from "@/lib/db";

import { asLocale, t } from "@/lib/i18n";

import { getSession } from "@/lib/session";



export default async function SettingsPage() {

  const session = await getSession();

  if (!session) redirect("/login");



  const [user, settings] = await Promise.all([

    prisma.user.findUnique({

      where: { id: session.user.id },

      select: { name: true, email: true },

    }),

    ensureUserSettings(session.user.id),

  ]);

  if (!user) redirect("/login");



  const lang = asLocale(settings.locale);



  return (

    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8 pb-24 md:pb-8">

      <PageIntro eyebrow={t(lang, "settingsEyebrow")} title={t(lang, "settingsTitle")}>

        <p>{t(lang, "settingsHint")}</p>

      </PageIntro>

      <SettingsForm

        name={user.name}

        email={user.email}


        enterToSend={settings.enterToSend}

        autoSpeak={settings.autoSpeak}

        showEmotions={settings.showEmotions}

        callAutoListen={settings.callAutoListen}

        nightRoom={settings.nightRoom}

        compactChat={settings.compactChat}

        doNotDisturb={settings.doNotDisturb}

        ambientSound={settings.ambientSound}

        statusLine={settings.statusLine}

        sleepMode={settings.sleepMode}
      />

      <div className="flex flex-wrap gap-3 text-sm">

        <Link href="/app/plus" className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">

          {t(lang, "plus")}

        </Link>

        <Link href="/app/create" className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">

          {t(lang, "create")}

        </Link>

        <Link href="/app/saved" className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">

          {t(lang, "navSaved")}

        </Link>

        <Link href="/app/data" className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">

          Your data

        </Link>

        <Link href="/support" className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">

          Support

        </Link>

        <Link href="/privacy" className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">

          Privacy

        </Link>

        <Link href="/terms" className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">

          Terms

        </Link>

      </div>

      <ExportRoom />

      <AccountSecurity email={user.email} />

    </main>

  );

}

