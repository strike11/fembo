"use client";

import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { COMPANION_PRESETS, companionExtra } from "@/lib/companions";
import { cn } from "@/lib/utils";

const LINES: Record<string, string> = {
  aki: "I put the kettle on. You can tell me the long version.",
  ren: "There you are. I was about to start without you — teasingly.",
  miko: "It's late. We can just sit. I don't need a plot.",
  nico: "Come lean here. Ears are for secrets, not for judging.",
  mint: "I'll purr if you stay. No rush. The room is already slow.",
};

export function CompanionStage() {
  const [slug, setSlug] = useState(COMPANION_PRESETS[0]?.slug ?? "aki");
  const companion = COMPANION_PRESETS.find((item) => item.slug === slug) ?? COMPANION_PRESETS[0];
  const extra = companionExtra(companion.slug);

  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div className="relative overflow-hidden rounded-[2rem] bg-card landing-shadow ring-1 ring-border">
        <Image
          src={companion.avatarPath}
          alt={companion.name}
          width={720}
          height={900}
          sizes="(min-width: 1024px) 520px, 100vw"
          className="aspect-[4/5] w-full object-cover"
          priority
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent p-5">
          <p className="font-heading text-2xl font-semibold">{companion.name}</p>
          <p className="text-sm text-muted-foreground">{extra.vibe}</p>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{companion.kind === "furry" ? "Anthro" : "Human"}</Badge>
          {extra.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-3xl font-semibold tracking-tight">{companion.tagline}</h3>
          <p className="max-w-md text-base leading-7 text-muted-foreground">{companion.lore}</p>
        </div>
        <blockquote className="rounded-2xl bg-muted/70 px-4 py-3 text-sm leading-6">
          “{LINES[companion.slug] ?? extra.starters[0]}”
        </blockquote>
        <div className="flex flex-wrap gap-2">
          {COMPANION_PRESETS.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setSlug(item.slug)}
              aria-pressed={item.slug === companion.slug}
              className={cn(
                "overflow-hidden rounded-2xl ring-1 transition",
                item.slug === companion.slug
                  ? "ring-2 ring-ring"
                  : "ring-border opacity-80 hover:opacity-100",
              )}
            >
              <Image
                src={item.avatarPath}
                alt={item.name}
                width={88}
                height={88}
                className="size-16 object-cover sm:size-20"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
