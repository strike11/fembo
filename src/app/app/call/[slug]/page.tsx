import { notFound, redirect } from "next/navigation";
import { CallRoomLoader } from "@/components/call-room-loader";
import { englishVoiceId } from "@/lib/companions";
import { ensureCompanionConfig, ensureUserSettings } from "@/lib/companion-service";
import { getSession } from "@/lib/session";

export default async function CallPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { slug } = await params;
  const ensured = await ensureCompanionConfig(session.user.id, slug);
  if (!ensured) notFound();

  const settings = await ensureUserSettings(session.user.id);

  return (
    <CallRoomLoader
      slug={slug}
      nickname={ensured.config.nickname}
      avatarPath={ensured.preset.avatarPath}
      voiceId={englishVoiceId(ensured.config.voiceId)}
      autoListen={settings.callAutoListen}
      locale={settings.locale}
    />
  );
}
