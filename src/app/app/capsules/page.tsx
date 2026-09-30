"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatRelative } from "@/lib/format";

type Capsule = {
  id: string;
  slug: string;
  body: string;
  openOn: string;
  opened: boolean;
  reply: string;
  createdAt: string;
};

export default function CapsulesPage() {
  const [items, setItems] = useState<Capsule[]>([]);
  const [slug, setSlug] = useState("aki");
  const [body, setBody] = useState("");
  const [openOn, setOpenOn] = useState("");

  useEffect(() => {
    void fetch("/api/capsules")
      .then((response) => response.json())
      .then((payload: { capsules?: Capsule[] }) => setItems(payload.capsules ?? []));
  }, []);

  async function add() {
    const response = await fetch("/api/capsules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, body, openOn }),
    });
    const payload = (await response.json()) as { capsule?: Capsule; error?: string };
    if (!response.ok || !payload.capsule) {
      toast.error(payload.error ?? "Could not seal it");
      return;
    }
    setItems((current) => [payload.capsule!, ...current]);
    setBody("");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Capsules" title="For a later version of you">
        <p>Write something now. When the date comes, they open it and sit with it.</p>
      </PageIntro>
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <CompanionSelect value={slug} onChange={setSlug} />
        <Input type="date" value={openOn} onChange={(event) => setOpenOn(event.target.value)} required />
        <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={3} />
        <Button type="submit">Seal capsule</Button>
      </form>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">
              {item.slug} · opens {item.openOn} · {item.opened ? "opened" : "sealed"}
            </p>
            <p className="mt-1 text-sm">{item.opened ? item.body : "Still closed."}</p>
            {item.opened && item.reply ? (
              <p className="mt-2 text-sm text-muted-foreground">{item.reply}</p>
            ) : null}
            <p className="mt-1 text-xs text-muted-foreground">{formatRelative(item.createdAt)}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
