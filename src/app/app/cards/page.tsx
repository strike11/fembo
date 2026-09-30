"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";

type Card = { id: string; slug: string; title: string; body: string; day: string };

export default function CardsPage() {
  const [items, setItems] = useState<Card[]>([]);
  const [slug, setSlug] = useState("aki");

  useEffect(() => {
    void fetch("/api/cards")
      .then((response) => response.json())
      .then((payload: { cards?: Card[] }) => setItems(payload.cards ?? []));
  }, []);

  async function draw() {
    const response = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const payload = (await response.json()) as { card?: Card; error?: string };
    if (!response.ok || !payload.card) {
      toast.error(payload.error ?? "The deck stayed closed");
      return;
    }
    setItems((current) => [payload.card!, ...current.filter((item) => item.id !== payload.card!.id)]);
    toast.success(payload.card.title);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Cards" title="A small omen from the house">
        <p>Not a prediction. A lamp with a name: The Open Window, The Second Cup.</p>
      </PageIntro>
      <div className="flex flex-wrap items-center gap-2">
        <CompanionSelect value={slug} onChange={setSlug} />
        <Button type="button" onClick={() => void draw()}>
          Draw
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">
              {item.slug} · {item.day}
            </p>
            <p className="mt-1 font-heading text-lg font-semibold">{item.title}</p>
            <p className="mt-1 text-sm">{item.body}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
