import { CompanionCard } from "@/components/companion-card";
import { PageIntro } from "@/components/page-intro";
import { companionExtra } from "@/lib/companions";
import { prisma } from "@/lib/db";
import { listRecents } from "@/lib/platform";
import { visiblePresetWhere } from "@/lib/presets";
import { getSession } from "@/lib/session";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CompanionsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [presets, recents, favorites] = await Promise.all([
    prisma.companionPreset.findMany({
      where: visiblePresetWhere(session.user.id),
      orderBy: { name: "asc" },
      include: {
        configs: {
          where: { userId: session.user.id },
          select: {
            nickname: true,
            treatYou: true,
            appearanceNotes: true,
            shyBold: true,
            sweetTeasing: true,
            calmEnergetic: true,
            voiceId: true,
          },
        },
      },
    }),
    listRecents(session.user.id, 8),
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      select: { slug: true },
    }),
  ]);
  const favored = new Set(favorites.map((item) => item.slug));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Chats" title="Pick a thread and stay in it">
        <p>One live conversation per companion, plus new chats whenever you want a clean page.</p>
      </PageIntro>
      {recents.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-semibold">Continue</h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recents.map((recent) => (
              <Link
                key={recent.id}
                href={`/app/companions/${recent.slug}`}
                className="flex min-w-56 items-center gap-3 rounded-2xl bg-card px-3 py-2 ring-1 ring-border"
              >
                <Image
                  src={recent.avatarPath}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full object-cover"
                />
                <div className="min-w-0 overflow-hidden">
                  <p className="truncate text-sm font-medium">{recent.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{recent.preview}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {presets.map((preset) => (
          <CompanionCard
            key={preset.id}
            slug={preset.slug}
            name={preset.configs[0]?.nickname || preset.name}
            tagline={companionExtra(preset.slug, preset.tagline).vibe}
            kind={preset.kind}
            avatarPath={preset.avatarPath}
            favored={favored.has(preset.slug)}
            customized={preset.configs.some(
              (config) =>
                config.nickname !== preset.name ||
                config.treatYou.length > 0 ||
                config.appearanceNotes.length > 0 ||
                config.shyBold !== preset.shyBold ||
                config.sweetTeasing !== preset.sweetTeasing ||
                config.calmEnergetic !== preset.calmEnergetic ||
                config.voiceId !== preset.defaultVoiceId,
            )}
          />
        ))}
      </div>
    </main>
  );
}
