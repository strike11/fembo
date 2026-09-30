import { notFound, redirect } from "next/navigation";
import { FemboyBuilder } from "@/components/femboy-builder";
import { PageIntro } from "@/components/page-intro";
import { DEFAULT_FEMBOY_LOOK, parseLookLock } from "@/lib/femboy-look";
import { ensureUserSettings } from "@/lib/companion-service";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function EditFemboyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { slug } = await params;

  const [settings, preset] = await Promise.all([
    ensureUserSettings(session.user.id),
    prisma.companionPreset.findFirst({
      where: { slug, ownerId: session.user.id },
    }),
  ]);
  if (!preset) notFound();

  const look = parseLookLock(preset.lookLock) ?? DEFAULT_FEMBOY_LOOK;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro
        eyebrow={settings.locale === "ru" ? "Редактировать" : "Edit"}
        title={preset.name}
      >
        <p>
          {settings.locale === "ru"
            ? "Меняй внешность — превью обновляется сразу."
            : "Change the look — preview updates live."}
        </p>
      </PageIntro>
      <FemboyBuilder
        locale={settings.locale}
        initialSlug={preset.slug}
        initialLook={look}
        initialName={preset.name}
        initialTagline={preset.tagline}
        initialLore={preset.lore}
        initialVoiceId={preset.defaultVoiceId}
      />
    </main>
  );
}
