"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Joke = { id: string; slug: string; content: string };

export default function JokesPage() {
  const [items, setItems] = useState<Joke[]>([]);
  const [slug, setSlug] = useState("aki");
  const [content, setContent] = useState("");

  useEffect(() => {
    void fetch("/api/jokes")
      .then((response) => response.json())
      .then((payload: { jokes?: Joke[] }) => setItems(payload.jokes ?? []));
  }, []);

  async function add() {
    const response = await fetch("/api/jokes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, content }),
    });
    const payload = (await response.json()) as { joke?: Joke; error?: string };
    if (!response.ok || !payload.joke) {
      toast.error(payload.error ?? "Could not save");
      return;
    }
    setItems((current) => [payload.joke!, ...current]);
    setContent("");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Inside jokes" title="The private dialect">
        <p>They may nod at these in chat. Nothing loud. Just the two of you.</p>
      </PageIntro>
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <CompanionSelect value={slug} onChange={setSlug} />
        <Input value={content} onChange={(event) => setContent(event.target.value)} placeholder="the window thing" />
        <Button type="submit">Keep joke</Button>
      </form>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-sm">{item.content}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.slug}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
