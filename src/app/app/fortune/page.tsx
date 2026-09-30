"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/format";

type Fortune = { id: string; slug: string; body: string; day: string; createdAt: string };

export default function FortunePage() {
  const [items, setItems] = useState<Fortune[]>([]);
  const [slug, setSlug] = useState("aki");
  const [affirmation, setAffirmation] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/fortune")
      .then((response) => response.json())
      .then((payload: { fortunes?: Fortune[] }) => setItems(payload.fortunes ?? []));
  }, []);

  async function draw() {
    setBusy(true);
    const response = await fetch("/api/fortune", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const payload = (await response.json()) as {
      fortune?: Fortune;
      affirmation?: string;
      error?: string;
    };
    setBusy(false);
    if (!response.ok || !payload.fortune) {
      toast.error(payload.error ?? "The slip stayed blank");
      return;
    }
    setItems((current) => [payload.fortune!, ...current.filter((item) => item.id !== payload.fortune!.id)]);
    setAffirmation(payload.affirmation ?? "");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Fortune" title="A slip for today">
        <p>One companion, one day. If the model is quiet, the house still writes something.</p>
      </PageIntro>
      {affirmation ? (
        <p className="rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-border">{affirmation}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <CompanionSelect value={slug} onChange={setSlug} />
        <Button type="button" disabled={busy} onClick={() => void draw()}>
          {busy ? "Drawing…" : "Draw today"}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">
              {item.slug} · {item.day} · {formatRelative(item.createdAt)}
            </p>
            <p className="mt-1 text-sm">{item.body}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
