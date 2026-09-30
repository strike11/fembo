import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { buttonVariants } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { prisma } from "@/lib/db";
import { formatRelative } from "@/lib/format";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function ArchivePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id, archived: true },
    orderBy: { lastMessageAt: "desc" },
    take: 40,
    include: {
      config: { include: { preset: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { content: true } },
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Archive" title="Older threads">
        <p>New chat tucks the last one here. Open it again anytime.</p>
      </PageIntro>
      {conversations.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyTitle>Archive is empty</EmptyTitle>
            <EmptyDescription>Start a new chat and the previous one lands here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-border"
            >
              <Image
                src={conversation.config.preset.avatarPath}
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{conversation.config.nickname}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {conversation.messages[0]?.content || conversation.title || "Empty thread"}
                </p>
                <p className="text-xs text-muted-foreground">{formatRelative(conversation.lastMessageAt)}</p>
              </div>
              <Link
                href={`/app/companions/${conversation.config.preset.slug}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                Open latest
              </Link>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
