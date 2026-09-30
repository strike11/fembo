"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";

type Outfit = { id: string; slug: string; day: string; look: string };

export default function WardrobePage() {
  const [items, setItems] = useState<Outfit[]>([]);
  const [slug, setSlug] = useState("aki");

  useEffect(() => {
    void fetch("/api/wardrobe")
      .then((response) => response.json())
      .then((payload: { outfits?: Outfit[] }) => setItems(payload.outfits ?? []));
  }, []);

  async function dress() {
    const response = await fetch("/api/wardrobe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const payload = (await response.json()) as { outfit?: Outfit; error?: string };
    if (!response.ok || !payload.outfit) {
      toast.error(payload.error ?? "The drawer stuck");
      return;
    }
    setItems((current) => [payload.outfit!, ...current.filter((item) => item.id !== payload.outfit!.id)]);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Wardrobe" title="What they put on">
        <p>A look for the day. It goes into chat so they are wearing something, not a void.</p>
      </PageIntro>
      <div className="flex flex-wrap items-center gap-2">
        <CompanionSelect value={slug} onChange={setSlug} />
        <Button type="button" onClick={() => void dress()}>
          Dress them
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">
              {item.slug} · {item.day}
            </p>
            <p className="mt-1 text-sm">{item.look}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
