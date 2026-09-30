"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { COMPANION_PRESETS } from "@/lib/companions";
import { formatRelative } from "@/lib/format";

const MOODS = ["soft", "tired", "happy", "lonely", "restless", "warm", "heavy"];

type Entry = {
  id: string;
  mood: string;
  content: string;
  reply: string;
  slug: string;
  createdAt: string;
};

export function JournalBoard({ initial }: { initial: Entry[] }) {
  const [entries, setEntries] = useState(initial);
  const [mood, setMood] = useState("soft");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState(COMPANION_PRESETS[0]?.slug ?? "aki");
  const [pending, setPending] = useState(false);

  async function save() {
    if (content.trim().length < 2) return;
    setPending(true);
    const response = await fetch("/api/journal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood, content, slug }),
    });
    const payload = (await response.json()) as { entry?: Entry; error?: string };
    setPending(false);
    if (!response.ok || !payload.entry) {
      toast.error(payload.error ?? "Could not save the check-in");
      return;
    }
    setEntries((current) => [payload.entry!, ...current]);
    setContent("");
    toast.success("They read it");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
        <div className="flex flex-wrap gap-1.5">
          {MOODS.map((item) => (
            <button
              key={item}
              type="button"
              className={`rounded-full px-3 py-1 text-sm ${mood === item ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              onClick={() => setMood(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="mt-3 flex flex-col gap-1.5 text-sm">
          Who should answer
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
        <Textarea
          className="mt-3"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="How is the day sitting on you?"
          rows={4}
        />
        <Button className="mt-3" disabled={pending} onClick={() => void save()}>
          Leave a check-in
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing written yet. The room can hold a little of the day.</p>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
              <p className="text-xs text-muted-foreground">
                {entry.mood} · {formatRelative(entry.createdAt)}
              </p>
              <p className="mt-1 text-sm">{entry.content}</p>
              {entry.reply ? (
                <p className="mt-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">{entry.reply}</p>
              ) : null}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
