import Image from "next/image";

import Link from "next/link";

import { notFound, redirect } from "next/navigation";

import { BondMeter } from "@/components/bond-meter";

import { CompanionCarePanel } from "@/components/companion-care-panel";

import { PageIntro } from "@/components/page-intro";

import { Badge } from "@/components/ui/badge";

import { buttonVariants } from "@/components/ui/button";

import { bondFromCounts } from "@/lib/bond";

import { ensureUserSettings } from "@/lib/companion-service";

import { companionExtra } from "@/lib/companions";

import { companionMood } from "@/lib/daily";

import { prisma } from "@/lib/db";

import { asLocale, sceneLabel, t } from "@/lib/i18n";

import { canOpenPreset } from "@/lib/presets";

import { companionBond } from "@/lib/platform";

import { SCENES } from "@/lib/scenes";

import { getSession } from "@/lib/session";

import { cn } from "@/lib/utils";



export default async function CompanionProfilePage({

  params,

}: {

  params: Promise<{ slug: string }>;

}) {

  const session = await getSession();

  if (!session) redirect("/login");

  const { slug } = await params;

  const preset = await prisma.companionPreset.findUnique({ where: { slug } });

  if (!preset || !canOpenPreset(preset, session.user.id)) notFound();



  const extra = companionExtra(slug, preset.tagline);

  const [settings, counts, memories] = await Promise.all([

    ensureUserSettings(session.user.id),

    companionBond(session.user.id, slug),

    prisma.memory.findMany({

      where: { userId: session.user.id, slug },

      orderBy: { createdAt: "desc" },

      take: 20,

    }),

  ]);

  const lang = asLocale(settings.locale);

  const bond = bondFromCounts(counts);



  return (

    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8 pb-24 md:pb-8">

      <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border">

        <Image

          src={preset.avatarPath}

          alt=""

          width={1200}

          height={700}

          className="aspect-[16/9] w-full object-cover motion-reduce:transition-none"

        />

        <div className="flex flex-col gap-3 p-5">

          <div className="flex flex-wrap items-start justify-between gap-3">

            <div>

              <PageIntro title={preset.name}>

                <p>{extra.vibe}</p>

              </PageIntro>

              <p className="mt-2 text-sm text-muted-foreground">

                Today they feel {companionMood(slug)}.

              </p>

            </div>

            <div className="flex gap-2">

              <Link href={`/app/companions/${slug}`} className={cn(buttonVariants())}>

                {t(lang, "chat")}

              </Link>

              <Link href={`/app/companions/${slug}/visual`} className={cn(buttonVariants({ variant: "secondary" }))}>

                {t(lang, "visual")}

              </Link>

              <Link href={`/app/call/${slug}`} className={cn(buttonVariants({ variant: "outline" }))}>

                {t(lang, "call")}

              </Link>

            </div>

          </div>

          <div className="flex flex-wrap gap-1.5">

            <Badge variant="secondary">{preset.kind === "furry" ? "Furry" : "Human"}</Badge>

            {extra.tags.map((tag) => (

              <Badge key={tag} variant="outline">

                {tag}

              </Badge>

            ))}

          </div>

          <p className="text-sm leading-7">{preset.lore}</p>

          <BondMeter bond={bond} />

        </div>

      </div>



      <CompanionCarePanel

        slug={slug}

        locale={settings.locale}

        initialMemories={memories.map((memory) => ({

          id: memory.id,

          slug: memory.slug,

          content: memory.content,

          createdAt: memory.createdAt.toISOString(),

        }))}

      />



      <section className="flex flex-col gap-3">

        <h2 className="font-heading text-lg font-semibold">{t(lang, "profileScenes")}</h2>

        <div className="grid gap-2 sm:grid-cols-2">

          {SCENES.map((scene) => (

            <Link

              key={scene.id}

              href={`/app/companions/${slug}?scene=${scene.id}`}

              className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border hover:bg-muted motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

            >

              <p className="text-sm font-medium">{sceneLabel(lang, scene.id)}</p>

              <p className="text-xs text-muted-foreground">{scene.hint}</p>

            </Link>

          ))}

        </div>

      </section>

    </main>

  );

}

