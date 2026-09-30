import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ConfigureForm } from "@/components/configure-form";
import { buttonVariants } from "@/components/ui/button";
import { englishVoiceId } from "@/lib/companions";
import { ensureCompanionConfig } from "@/lib/companion-service";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function ConfigurePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { slug } = await params;
  const ensured = await ensureCompanionConfig(session.user.id, slug);
  if (!ensured) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 overflow-y-auto px-4 py-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image
            src={ensured.preset.avatarPath}
            alt=""
            width={48}
            height={48}
            className="size-12 rounded-full object-cover"
          />
          <div>
            <h1 className="text-2xl font-semibold">Tune {ensured.preset.name}</h1>
            <p className="text-sm text-muted-foreground">{ensured.preset.tagline}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/app/call/${slug}`} className={cn(buttonVariants({ variant: "outline" }))}>
            Call
          </Link>
          <Link href={`/app/companions/${slug}`} className={cn(buttonVariants())}>
            Chat
          </Link>
        </div>
      </div>
      <ConfigureForm
        slug={slug}
        initial={{
          nickname: ensured.config.nickname,
          shyBold: ensured.config.shyBold,
          sweetTeasing: ensured.config.sweetTeasing,
          calmEnergetic: ensured.config.calmEnergetic,
          treatYou: ensured.config.treatYou,
          appearanceNotes: ensured.config.appearanceNotes,
          callYou: ensured.config.callYou,
          voiceId: englishVoiceId(ensured.config.voiceId),
        }}
      />
    </main>
  );
}
