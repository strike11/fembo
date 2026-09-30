"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelative } from "@/lib/format";

type Quote = { id: string; slug: string; body: string; createdAt: string };

export default function QuotesPage() {
  const [items, setItems] = useState<Quote[]>([]);
  const [slug, setSlug] = useState("aki");
  const [body, setBody] = useState("");

  useEffect(() => {
    void fetch("/api/quotes")
      .then((response) => response.json())
      .then((payload: { quotes?: Quote[] }) => setItems(payload.quotes ?? []));
  }, []);

  async function add() {
    const response = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, body }),
    });
    const payload = (await response.json()) as { quote?: Quote; error?: string };
    if (!response.ok || !payload.quote) {
      toast.error(payload.error ?? "Could not pin that");
      return;
    }
    setItems((current) => [payload.quote!, ...current]);
    setBody("");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Quotes" title="The wall">
        <p>Pin a line from chat, or write one you do not want the thread to swallow.</p>
      </PageIntro>
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <CompanionSelect value={slug} onChange={setSlug} />
        <Textarea value={body} onChange={(event) => setBody(event.target.value)} rows={3} />
        <Button type="submit">Pin quote</Button>
      </form>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-sm leading-7">“{item.body}”</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.slug} · {formatRelative(item.createdAt)}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
