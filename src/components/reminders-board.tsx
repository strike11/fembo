"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COMPANION_PRESETS } from "@/lib/companions";

type ReminderItem = {
  id: string;
  slug: string;
  content: string;
  dueLabel: string;
  done: boolean;
};

export function RemindersBoard({ initial }: { initial: ReminderItem[] }) {
  const [items, setItems] = useState(initial);
  const [slug, setSlug] = useState("aki");
  const [content, setContent] = useState("");
  const [dueLabel, setDueLabel] = useState("tonight");

  async function add() {
    if (content.trim().length < 2) return;
    const response = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, content, dueLabel }),
    });
    const payload = (await response.json()) as { reminder?: ReminderItem; error?: string };
    if (!response.ok || !payload.reminder) {
      toast.error(payload.error ?? "Could not save");
      return;
    }
    setItems((current) => [payload.reminder!, ...current]);
    setContent("");
  }

  async function finish(id: string) {
    await fetch("/api/reminders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, done: true }),
    });
    setItems((current) => current.map((item) => (item.id === id ? { ...item, done: true } : item)));
  }

  return (
    <div className="flex flex-col gap-5">
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <label className="flex flex-col gap-1.5 text-sm">
          Companion
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
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          Remind me
          <Input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Drink water" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          When
          <Input value={dueLabel} onChange={(event) => setDueLabel(event.target.value)} />
        </label>
        <Button type="submit">Save</Button>
      </form>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <div>
              <p className={item.done ? "text-sm text-muted-foreground line-through" : "text-sm"}>{item.content}</p>
              <p className="text-xs text-muted-foreground">
                {item.dueLabel} · {item.slug}
              </p>
            </div>
            {item.done ? null : (
              <Button size="sm" variant="outline" onClick={() => void finish(item.id)}>
                Done
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
