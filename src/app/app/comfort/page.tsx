"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/format";

type Row = { id: string; slug: string; reply: string; createdAt: string };

export default function ComfortPage() {
  const [items, setItems] = useState<Row[]>([]);
  const [slug, setSlug] = useState("aki");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/comfort")
      .then((response) => response.json())
      .then((payload: { comforts?: Row[] }) => setItems(payload.comforts ?? []));
  }, []);

  async function ask() {
    setBusy(true);
    const response = await fetch("/api/comfort", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const payload = (await response.json()) as { comfort?: Row; error?: string };
    setBusy(false);
    if (!response.ok || !payload.comfort) {
      toast.error(payload.error ?? "The room stayed quiet");
      return;
    }
    setItems((current) => [payload.comfort!, ...current]);
    toast.success(payload.comfort.reply);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Comfort" title="I need you">
        <p>No plot. No performance. They sit down in a sentence or two.</p>
      </PageIntro>
      <div className="flex flex-wrap items-center gap-2">
        <CompanionSelect value={slug} onChange={setSlug} />
        <Button type="button" disabled={busy} onClick={() => void ask()}>
          {busy ? "Coming…" : "Come sit"}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">
              {item.slug} · {formatRelative(item.createdAt)}
            </p>
            <p className="mt-1 text-sm">{item.reply}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
