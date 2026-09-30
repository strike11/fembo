"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Wish = { id: string; slug: string; content: string; done: boolean };

export default function BucketPage() {
  const [items, setItems] = useState<Wish[]>([]);
  const [slug, setSlug] = useState("aki");
  const [content, setContent] = useState("");

  useEffect(() => {
    void fetch("/api/bucket")
      .then((response) => response.json())
      .then((payload: { wishes?: Wish[] }) => setItems(payload.wishes ?? []));
  }, []);

  async function add() {
    const response = await fetch("/api/bucket", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, content }),
    });
    const payload = (await response.json()) as { wish?: Wish; error?: string };
    if (!response.ok || !payload.wish) {
      toast.error(payload.error ?? "Could not save");
      return;
    }
    setItems((current) => [payload.wish!, ...current]);
    setContent("");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Bucket" title="Someday, together">
        <p>A walk in rain. A late film. A night you have not named yet.</p>
      </PageIntro>
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <CompanionSelect value={slug} onChange={setSlug} />
        <Input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Stay up for a storm" />
        <Button type="submit">Add wish</Button>
      </form>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="rounded-2xl bg-card px-4 py-3 text-left ring-1 ring-border"
            onClick={() => {
              void fetch("/api/bucket", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: item.id }),
              }).then(() =>
                setItems((current) =>
                  current.map((row) => (row.id === item.id ? { ...row, done: !row.done } : row)),
                ),
              );
            }}
          >
            <p className={`text-sm ${item.done ? "text-muted-foreground line-through" : ""}`}>{item.content}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.slug}</p>
          </button>
        ))}
      </div>
    </main>
  );
}
