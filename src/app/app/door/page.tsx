"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelative } from "@/lib/format";

type Row = { id: string; slug: string; body: string; reply: string; createdAt: string };

export default function DoorPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [slug, setSlug] = useState("aki");
  const [body, setBody] = useState("");

  useEffect(() => {
    void fetch("/api/door")
      .then((response) => response.json())
      .then((payload: { notes?: Row[] }) => setItems(payload.notes ?? []));
  }, []);

  async function leave() {
    const response = await fetch("/api/door", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, body }),
    });
    const payload = (await response.json()) as { note?: Row; error?: string };
    if (!response.ok || !payload.note) {
      toast.error(payload.error ?? "The door did not take it");
      return;
    }
    setItems((current) => [payload.note!, ...current]);
    setBody("");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Door" title="A note on the latch">
        <p>You do not have to come in yet. They will read it from the other side.</p>
      </PageIntro>
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          void leave();
        }}
      >
        <CompanionSelect value={slug} onChange={setSlug} />
        <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={3} placeholder="Back late. Leave the lamp." />
        <Button type="submit">Pin to the door</Button>
      </form>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">
              {item.slug} · {formatRelative(item.createdAt)}
            </p>
            <p className="mt-1 text-sm">{item.body}</p>
            {item.reply ? <p className="mt-2 text-sm text-muted-foreground">{item.reply}</p> : null}
          </article>
        ))}
      </div>
    </main>
  );
}
