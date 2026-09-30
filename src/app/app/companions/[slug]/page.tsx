import { ChevronLeftIcon, UserRoundIcon } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChatThreadLoader } from "@/components/chat-thread-loader";
import { CompanionPortrait } from "@/components/companion-portrait";
import { RoomModes } from "@/components/room-modes";
import { buttonVariants } from "@/components/ui/button";
import { ensureCompanionConfig, ensureUserSettings } from "@/lib/companion-service";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function CompanionChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ scene?: string; say?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { slug } = await params;
  const query = await searchParams;
  const ensured = await ensureCompanionConfig(session.user.id, slug);
  if (!ensured) notFound();

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
    <main className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-3">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/app/companions"
              aria-label="Back to chats"
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <ChevronLeftIcon />
            </Link>
            <CompanionPortrait
              slug={slug}
              avatarPath={ensured.preset.avatarPath}
              lookLock={ensured.preset.lookLock}
              width={36}
              height={36}
              className="size-9 overflow-hidden rounded-full"
              alt={ensured.config.nickname}
            />
            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold">{ensured.config.nickname}</h1>
              <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Available · {ensured.preset.tagline}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <RoomModes slug={slug} active="chat" locale={settings.locale} />
            <Link
              href={`/app/companions/${slug}/profile`}
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
              aria-label="Profile"
            >
              <UserRoundIcon />
            </Link>
            <Link
              href={`/app/companions/${slug}/configure`}
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              Tune
            </Link>
          </div>
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
        initialScene={query.scene || ensured.conversation.scene}
        initialPrompt={query.say ?? ""}
        locale={settings.locale}
        vibe={ensured.preset.tagline}
      />
    </main>
  );
}
