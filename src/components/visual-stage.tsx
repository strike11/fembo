"use client";

import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import { CompanionPortrait, expressionFromMessage } from "@/components/companion-portrait";
import { RoleplayText } from "@/components/roleplay-text";
import { parseLookLock } from "@/lib/femboy-look";
import { defaultPortrait } from "@/lib/sprites";
import { cn } from "@/lib/utils";

type Line = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function VisualStage({
  slug,
  spriteSrc,
  avatarPath,
  lookLock,
  nickname,
  messages,
  showEmotions,
  pending,
  children,
}: {
  slug: string;
  spriteSrc: string;
  avatarPath?: string;
  lookLock?: string | null;
  nickname: string;
  messages: Line[];
  showEmotions: boolean;
  pending: boolean;
  children: ReactNode;
}) {
  const customLook = parseLookLock(lookLock);
  const lastAssistant = [...messages].reverse().find((line) => line.role === "assistant");
  const expression = useMemo(
    () => (lastAssistant ? expressionFromMessage(lastAssistant.content) : "smile"),
    [lastAssistant],
  );
  const [brokenSource, setBrokenSource] = useState<string | null>(null);
  const shown =
    brokenSource === spriteSrc ? defaultPortrait(slug, avatarPath) : spriteSrc;
  const recent = messages.slice(-3);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#1a1410]">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/70" />
      <div className="relative mx-auto flex min-h-0 w-full max-w-xl flex-[1] items-end justify-center px-8 pt-16 pb-1">
        <div className="relative aspect-[3/4] h-full max-h-[52vh] w-auto">
          {customLook ? (
            <CompanionPortrait
              slug={slug}
              lookLock={lookLock}
              expression={expression}
              animated
              className="animate-in fade-in h-full w-full duration-500"
              alt={nickname}
            />
          ) : (
            <Image
              key={shown}
              src={shown}
              alt=""
              fill
              sizes="(max-width: 768px) 70vw, 28rem"
              className={cn(
                "object-contain object-bottom transition-opacity duration-500",
                "animate-in fade-in duration-500",
              )}
              priority
              onError={() => setBrokenSource(spriteSrc)}
            />
          )}
        </div>
      </div>
      <div className="relative z-10 flex shrink-0 flex-col gap-2 px-3 pb-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-1.5">
          {recent.map((message) => (
            <div
              key={message.id}
              className={cn(
                "max-w-[90%] rounded-2xl px-3 py-1.5 text-sm leading-5 shadow-sm backdrop-blur-md",
                message.role === "user"
                  ? "ml-auto bg-white/18 text-white"
                  : "bg-black/50 text-white",
              )}
            >
              {message.role === "assistant" ? (
                <p className="mb-0.5 text-[11px] font-medium text-white/70">{nickname}</p>
              ) : null}
              {message.content ? (
                showEmotions ? (
                  <RoleplayText
                    content={message.content}
                    tone={message.role === "user" ? "user" : "assistant"}
                    onDark
                  />
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )
              ) : pending ? (
                <span className="text-white/60">…</span>
              ) : null}
            </div>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
