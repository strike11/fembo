"use client";

import Image from "next/image";
import { EmotionChip } from "@/components/emotion-chip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProductDemo() {
  return (
    <Tabs defaultValue="chat" className="gap-5">
      <TabsList className="h-11 rounded-full px-1">
        <TabsTrigger value="chat" className="rounded-full px-4">
          Chat
        </TabsTrigger>
        <TabsTrigger value="call" className="rounded-full px-4">
          Call
        </TabsTrigger>
        <TabsTrigger value="remember" className="rounded-full px-4">
          Remember
        </TabsTrigger>
      </TabsList>
      <TabsContent value="chat">
        <div className="overflow-hidden rounded-[1.7rem] bg-card landing-shadow ring-1 ring-border">
          <div className="flex items-center gap-3 border-b border-border/70 px-4 py-3">
            <Image
              src="/companions/aki.png"
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium">Aki</p>
              <p className="text-xs text-muted-foreground">Room · tea · one thread</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 px-4 py-5">
            <p className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-primary/15 px-3 py-2 text-sm">
              I&apos;m home. It was a long one.
            </p>
            <div className="flex max-w-[90%] flex-col gap-2 rounded-2xl rounded-bl-md bg-muted px-3 py-2">
              <EmotionChip id="blushy" label="blushy" />
              <p className="text-sm leading-6">
                Then sit. I already warmed a cup. You don&apos;t have to be impressive here.
              </p>
            </div>
            <p className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-primary/15 px-3 py-2 text-sm">
              Remember I get quiet when I&apos;m tired, not distant.
            </p>
            <div className="flex max-w-[90%] flex-col gap-2 rounded-2xl rounded-bl-md bg-muted px-3 py-2">
              <EmotionChip id="nod" label="kept" />
              <p className="text-sm leading-6">Kept. Quiet is still you. I&apos;ll stay soft.</p>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="call">
        <div className="relative overflow-hidden rounded-[1.7rem] landing-shadow">
          <div className="call-room flex min-h-[22rem] flex-col items-center justify-center gap-6 px-6 py-10 text-center text-white">
            <div className="call-room-glow" />
            <div className="call-avatar call-avatar-live">
              <Image
                src="/companions/miko.png"
                alt="Miko"
                width={128}
                height={128}
                className="size-28 rounded-full object-cover"
              />
            </div>
            <div>
              <p className="font-heading text-2xl font-semibold">Miko</p>
              <p className="text-sm text-white/70">Live · 04:12 · speaker on</p>
            </div>
            <div className="flex h-10 items-end gap-1">
              {Array.from({ length: 12 }, (_, index) => (
                <span
                  key={index}
                  className="wave-bar w-1 rounded-full bg-white/80"
                  style={{ animationDelay: `${index * 70}ms` }}
                />
              ))}
            </div>
            <p className="max-w-sm text-sm text-white/80">
              Short spoken lines. They listen when you finish. Same thread as the chat.
            </p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="remember">
        <div className="flex flex-col gap-3">
          {[
            ["You get quiet when tired", "Pinned from chat · Aki"],
            ["Tea, not coffee, after 8", "Memory · Miko"],
            ["Nico may use your name softly", "Handshake"],
          ].map(([title, meta]) => (
            <article key={title} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
            </article>
          ))}
          <p className="text-sm text-muted-foreground">
            Say “remember …” or pin a line. They bring it back next time — not a scrapbook of everything you ever typed.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
