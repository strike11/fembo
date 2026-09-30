"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Song = { id: string; slug: string; title: string; note: string };

export default function PlaylistPage() {
  const [items, setItems] = useState<Song[]>([]);
  const [slug, setSlug] = useState("aki");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    void fetch("/api/playlist")
      .then((response) => response.json())
      .then((payload: { songs?: Song[] }) => setItems(payload.songs ?? []));
  }, []);

  async function add() {
    const response = await fetch("/api/playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, title, note }),
    });
    const payload = (await response.json()) as { song?: Song; error?: string };
    if (!response.ok || !payload.song) {
      toast.error(payload.error ?? "Could not add that");
      return;
    }
    setItems((current) => [payload.song!, ...current]);
    setTitle("");
    setNote("");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Playlist" title="Songs they keep">
        <p>No files. Just titles and why the room likes them.</p>
      </PageIntro>
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <CompanionSelect value={slug} onChange={setSlug} />
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Song title" />
        <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Why this one" />
        <Button type="submit">Add song</Button>
      </form>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-sm text-muted-foreground">
              {item.slug}
              {item.note ? ` · ${item.note}` : ""}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
