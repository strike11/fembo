"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { COMPANION_PRESETS } from "@/lib/companions";
import { formatRelative } from "@/lib/format";

type MemoryItem = {
  id: string;
  slug: string;
  content: string;
  createdAt: string;
};

export function MemoriesBoard({ initial }: { initial: MemoryItem[] }) {
  const [memories, setMemories] = useState(initial);
  const [slug, setSlug] = useState(COMPANION_PRESETS[0]?.slug ?? "aki");
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const shown = memories.filter((item) =>
    item.content.toLowerCase().includes(query.trim().toLowerCase()),
  );

  async function addMemory() {
    const text = content.trim();
    if (text.length < 3) return;
    const response = await fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, content: text }),
    });
    const payload = (await response.json()) as { memory?: MemoryItem; error?: string };
    if (!response.ok || !payload.memory) {
      toast.error(payload.error ?? "Could not save that");
      return;
    }
    setMemories((current) => [payload.memory!, ...current]);
    setContent("");
    toast.success("Remembered");
  }

  async function remove(id: string) {
    const response = await fetch("/api/memories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) {
      toast.error("Could not delete");
      return;
    }
    setMemories((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border sm:flex-row sm:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          void addMemory();
        }}
      >
        <label className="flex flex-1 flex-col gap-1.5 text-sm">
          Companion
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
        </label>
        <label className="flex flex-[2] flex-col gap-1.5 text-sm">
          Remember
          <Input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="My favorite drink is tea"
          />
        </label>
        <Button type="submit">Save</Button>
      </form>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search memories"
      />
      <div className="flex flex-col gap-2">
        {shown.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing stored yet. Say “remember …” in chat, or add a note here.
          </p>
        ) : (
          shown.map((memory) => {
            const companion = COMPANION_PRESETS.find((item) => item.slug === memory.slug);
            return (
              <div
                key={memory.id}
                className="flex items-start justify-between gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-border"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{companion?.name ?? memory.slug}</p>
                  <p className="text-sm text-foreground/80">{memory.content}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatRelative(memory.createdAt)}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => void remove(memory.id)}>
                  Forget
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
