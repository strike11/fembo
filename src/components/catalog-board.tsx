"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Item = {
  id: string;
  slug: string;
  kind: string;
  title: string;
  note: string;
  body: string;
};

export function CatalogBoard({
  kind,
  titlePlaceholder,
  extra,
}: {
  kind: "recipe" | "book" | "watch";
  titlePlaceholder: string;
  extra: "body" | "note";
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [slug, setSlug] = useState("aki");
  const [title, setTitle] = useState("");
  const [extraValue, setExtraValue] = useState("");

  useEffect(() => {
    void fetch(`/api/catalog?kind=${kind}`)
      .then((response) => response.json())
      .then((payload: { items?: Item[] }) => setItems(payload.items ?? []));
  }, [kind]);

  async function add() {
    const response = await fetch("/api/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        kind,
        title,
        note: extra === "note" ? extraValue : "",
        body: extra === "body" ? extraValue : "",
      }),
    });
    const payload = (await response.json()) as { item?: Item; error?: string };
    if (!response.ok || !payload.item) {
      toast.error(payload.error ?? "Could not keep that");
      return;
    }
    setItems((current) => [payload.item!, ...current]);
    setTitle("");
    setExtraValue("");
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <CompanionSelect value={slug} onChange={setSlug} />
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder={titlePlaceholder} />
        {extra === "body" ? (
          <Textarea value={extraValue} onChange={(event) => setExtraValue(event.target.value)} rows={3} placeholder="How you make it" />
        ) : (
          <Input value={extraValue} onChange={(event) => setExtraValue(event.target.value)} placeholder="Why this one" />
        )}
        <Button type="submit">Keep it</Button>
      </form>
      {items.map((item) => (
        <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.slug}</p>
          {item.note ? <p className="mt-1 text-sm">{item.note}</p> : null}
          {item.body ? <p className="mt-1 whitespace-pre-wrap text-sm">{item.body}</p> : null}
        </article>
      ))}
    </div>
  );
}
