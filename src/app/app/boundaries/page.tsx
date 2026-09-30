"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Row = { id: string; content: string };

export default function BoundariesPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [content, setContent] = useState("");

  useEffect(() => {
    void fetch("/api/boundaries")
      .then((response) => response.json())
      .then((payload: { boundaries?: Row[] }) => setItems(payload.boundaries ?? []));
  }, []);

  async function add() {
    const response = await fetch("/api/boundaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const payload = (await response.json()) as { boundary?: Row; error?: string };
    if (!response.ok || !payload.boundary) {
      toast.error(payload.error ?? "Could not keep that line");
      return;
    }
    setItems((current) => [payload.boundary!, ...current]);
    setContent("");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Boundaries" title="What the room will not do">
        <p>These go into every chat and call. They are not a joke. Companions stay gentle and SFW.</p>
      </PageIntro>
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <Input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Don't push if I go quiet" />
        <Button type="submit">Keep boundary</Button>
      </form>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <article key={item.id} className="flex items-start justify-between gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-sm">{item.content}</p>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:underline"
              onClick={() => {
                void fetch("/api/boundaries", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: item.id }),
                }).then(() => setItems((current) => current.filter((row) => row.id !== item.id)));
              }}
            >
              Remove
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
