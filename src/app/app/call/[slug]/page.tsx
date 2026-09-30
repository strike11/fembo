import { notFound, redirect } from "next/navigation";
import { CallRoomLoader } from "@/components/call-room-loader";
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
      voiceId={ensured.config.voiceId}
      autoListen={settings.callAutoListen}
      locale={settings.locale}
    />
  );
}
