"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelative } from "@/lib/format";

type Item = { id: string; kind: string; body: string; createdAt: string };

export default function FeedbackPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [kind, setKind] = useState("idea");
  const [body, setBody] = useState("");

  useEffect(() => {
    void fetch("/api/feedback")
      .then((response) => response.json())
      .then((payload: { items?: Item[] }) => setItems(payload.items ?? []));
  }, []);

  async function send() {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, body, href: window.location.pathname }),
    });
    const payload = (await response.json()) as { item?: Item; error?: string };
    if (!response.ok || !payload.item) {
      toast.error(payload.error ?? "Could not send that");
      return;
    }
    setItems((current) => [payload.item!, ...current]);
    setBody("");
    toast.success("Noted");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Feedback" title="Tell the house">
        <p>Bugs, ideas, or a safety note. It stays on your account until we can read it.</p>
      </PageIntro>
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <select
          value={kind}
          onChange={(event) => setKind(event.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="idea">Idea</option>
          <option value="bug">Bug</option>
          <option value="safety">Safety</option>
        </select>
        <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} />
        <Button type="submit">Send note</Button>
      </form>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">
              {item.kind} · {formatRelative(item.createdAt)}
            </p>
            <p className="mt-1 text-sm">{item.body}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
