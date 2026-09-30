"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { COMPANION_PRESETS } from "@/lib/companions";
import { formatRelative } from "@/lib/format";

type DreamItem = { id: string; slug: string; body: string; createdAt: string };

export default function DreamsPage() {
  const [dreams, setDreams] = useState<DreamItem[]>([]);
  const [slug, setSlug] = useState("aki");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    void fetch("/api/dreams")
      .then((response) => response.json())
      .then((payload: { dreams?: DreamItem[] }) => setDreams(payload.dreams ?? []));
  }, []);

  async function ask() {
    setPending(true);
    const response = await fetch("/api/dreams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const payload = (await response.json()) as { dream?: DreamItem; error?: string };
    setPending(false);
    if (!response.ok || !payload.dream) {
      toast.error(payload.error ?? "They are still asleep");
      return;
    }
    setDreams((current) => [payload.dream!, ...current]);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Dreams" title="What they dreamed">
        <p>A new dream lands each day. You can also ask someone to tell you another.</p>
      </PageIntro>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          Ask
          <select
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5"
          >
            {COMPANION_PRESETS.map((companion) => (
              <option key={companion.slug} value={companion.slug}>
                {companion.name}
              </option>
            ))}
          </select>
        </label>
        <Button disabled={pending} onClick={() => void ask()}>
          Tell me a dream
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {dreams.map((dream) => {
          const companion = COMPANION_PRESETS.find((item) => item.slug === dream.slug);
          return (
            <article key={dream.id} className="rounded-3xl bg-card px-5 py-4 ring-1 ring-border">
              <p className="text-xs text-muted-foreground">
                {companion?.name ?? dream.slug} · {formatRelative(dream.createdAt)}
              </p>
              <p className="mt-2 text-sm leading-7">{dream.body}</p>
            </article>
          );
        })}
      </div>
    </main>
  );
}
