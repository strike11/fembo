"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { COMPANION_PRESETS } from "@/lib/companions";
import { formatRelative } from "@/lib/format";

type Story = { id: string; slug: string; title: string; body: string; createdAt: string };

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [slug, setSlug] = useState("aki");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/stories")
      .then((response) => response.json())
      .then((payload: { stories?: Story[] }) => setStories(payload.stories ?? []));
  }, []);

  async function write() {
    setBusy(true);
    const response = await fetch("/api/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const payload = (await response.json()) as { story?: Story; error?: string };
    setBusy(false);
    if (!response.ok || !payload.story) {
      toast.error(payload.error ?? "Story did not land");
      return;
    }
    setStories((current) => [payload.story!, ...current]);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Sleep stories" title="Something soft before bed">
        <p>A short story in their voice. Lights down. No homework.</p>
      </PageIntro>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          {COMPANION_PRESETS.map((companion) => (
            <option key={companion.slug} value={companion.slug}>
              {companion.name}
            </option>
          ))}
        </select>
        <Button type="button" disabled={busy} onClick={() => void write()}>
          {busy ? "Writing…" : "Tell me a story"}
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {stories.map((story) => (
          <article key={story.id} className="rounded-2xl bg-card px-4 py-4 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">
              {story.slug} · {formatRelative(story.createdAt)}
            </p>
            <p className="mt-1 font-heading text-lg font-semibold">{story.title}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{story.body}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
