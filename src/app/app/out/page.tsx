"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Outing = { id: string; slug: string; away: boolean; note: string };

export default function OutPage() {
  const [items, setItems] = useState<Outing[]>([]);
  const [slug, setSlug] = useState("aki");
  const [note, setNote] = useState("");

  useEffect(() => {
    void fetch("/api/outings")
      .then((response) => response.json())
      .then((payload: { outings?: Outing[] }) => setItems(payload.outings ?? []));
  }, []);

  async function setAway(away: boolean) {
    const response = await fetch("/api/outings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, away, note }),
    });
    const payload = (await response.json()) as { outing?: Outing; reply?: string; error?: string };
    if (!response.ok || !payload.outing) {
      toast.error(payload.error ?? "The latch stuck");
      return;
    }
    setItems((current) => {
      const rest = current.filter((item) => item.slug !== payload.outing!.slug);
      return [payload.outing!, ...rest];
    });
    if (payload.reply) toast.success(payload.reply);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Out" title="Leave, then come home">
        <p>They keep the room while you are gone. Chat knows you are texting from the street.</p>
      </PageIntro>
      <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
        <CompanionSelect value={slug} onChange={setSlug} />
        <Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Shop. Back soon." />
        <div className="flex gap-2">
          <Button type="button" onClick={() => void setAway(true)}>
            I am out
          </Button>
          <Button type="button" variant="outline" onClick={() => void setAway(false)}>
            I am back
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-sm font-medium">
              {item.slug} · {item.away ? "out" : "home"}
            </p>
            {item.note ? <p className="text-sm text-muted-foreground">{item.note}</p> : null}
          </article>
        ))}
      </div>
    </main>
  );
}
