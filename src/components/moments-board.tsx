"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { COMPANION_PRESETS } from "@/lib/companions";
import { formatRelative } from "@/lib/format";

type MomentItem = { id: string; slug: string; title: string; body: string; createdAt: string };

export function MomentsBoard({ initial }: { initial: MomentItem[] }) {
  const [items, setItems] = useState(initial);
  const [slug, setSlug] = useState("aki");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function add() {
    const response = await fetch("/api/moments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, title, body }),
    });
    const payload = (await response.json()) as { moment?: MomentItem; error?: string };
    if (!response.ok || !payload.moment) {
      toast.error(payload.error ?? "Could not keep that");
      return;
    }
    setItems((current) => [payload.moment!, ...current]);
    setTitle("");
    setBody("");
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <label className="flex flex-col gap-1.5 text-sm">
          With
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
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Title" />
        <Textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="What happened" rows={3} />
        <Button type="submit">Keep this moment</Button>
      </form>
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const companion = COMPANION_PRESETS.find((entry) => entry.slug === item.slug);
          return (
            <article key={item.id} className="rounded-3xl bg-card px-5 py-4 ring-1 ring-border">
              <p className="text-xs text-muted-foreground">
                {companion?.name} · {formatRelative(item.createdAt)}
              </p>
              <h2 className="font-heading mt-1 text-lg font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm leading-7">{item.body}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
