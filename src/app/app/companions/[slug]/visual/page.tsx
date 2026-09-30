import { ChevronLeftIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChatThreadLoader } from "@/components/chat-thread-loader";
import { CompanionPortrait } from "@/components/companion-portrait";
import { RoomModes } from "@/components/room-modes";
import { buttonVariants } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";
import { ensureCompanionConfig, ensureUserSettings } from "@/lib/companion-service";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function VisualChatPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { slug } = await params;
  const ensured = await ensureCompanionConfig(session.user.id, slug);
  if (!ensured) notFound();

  void trackEvent("visual_open", {
    userId: session.user.id,
    metadata: { slug },
  });

  const [settings, rawMessages] = await Promise.all([
    ensureUserSettings(session.user.id),
    prisma.message.findMany({
      where: { conversationId: ensured.conversation.id },
      orderBy: { createdAt: "asc" },
      take: 28,
      select: { id: true, role: true, content: true, reaction: true, createdAt: true },
    }),
  ]);

  const messages = rawMessages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    reaction: message.reaction,
    createdAt: message.createdAt.toISOString(),
  }));

  return (
    <main className="relative flex min-h-0 flex-1 flex-col">
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 bg-gradient-to-b from-black/55 to-transparent px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/app/companions"
            aria-label="Back to chats"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-white hover:bg-white/15")}
          >
            <ChevronLeftIcon />
          </Link>
          <CompanionPortrait
            slug={slug}
            avatarPath={ensured.preset.avatarPath}
            lookLock={ensured.preset.lookLock}
            width={32}
            height={32}
            className="size-8 overflow-hidden rounded-full ring-1 ring-white/40"
            alt={ensured.config.nickname}
          />
          <p className="truncate text-sm font-semibold text-white">{ensured.config.nickname}</p>
        </div>
        <div className="flex items-center gap-1">
          <RoomModes slug={slug} active="visual" locale={settings.locale} />
          <Link
            href={`/app/companions/${slug}/profile`}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-white hover:bg-white/15")}
            aria-label="Profile"
          >
            <UserRoundIcon />
          </Link>
        </div>
      </header>
      <ChatThreadLoader
        slug={slug}
        nickname={ensured.config.nickname}
        avatarPath={ensured.preset.avatarPath}
        lookLock={ensured.preset.lookLock}
        voiceId={ensured.config.voiceId}
        conversationId={ensured.conversation.id}
        initialMessages={messages}
        enterToSend={settings.enterToSend}
        autoSpeak={settings.autoSpeak}
        showEmotions={settings.showEmotions}
        compactChat={settings.compactChat}
        ambientSound={settings.ambientSound}
        sleepMode={settings.sleepMode}
        statusLine={settings.statusLine}
        initialScene={ensured.conversation.scene}
        layout="visual"
        locale={settings.locale}
        vibe={ensured.preset.tagline}
      />
    </main>
  );
}
