"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PromiseRow = {
  id: string;
  slug: string;
  content: string;
  keeper: string;
  done: boolean;
};

export default function PromisesPage() {
  const [items, setItems] = useState<PromiseRow[]>([]);
  const [slug, setSlug] = useState("aki");
  const [content, setContent] = useState("");
  const [keeper, setKeeper] = useState<"you" | "them">("them");

  useEffect(() => {
    void fetch("/api/promises")
      .then((response) => response.json())
      .then((payload: { promises?: PromiseRow[] }) => setItems(payload.promises ?? []));
  }, []);

  async function add() {
    const response = await fetch("/api/promises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, content, keeper }),
    });
    const payload = (await response.json()) as { promise?: PromiseRow; error?: string };
    if (!response.ok || !payload.promise) {
      toast.error(payload.error ?? "Could not keep that");
      return;
    }
    setItems((current) => [payload.promise!, ...current]);
    setContent("");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Promises" title="What was sworn">
        <p>They remember these in chat. Mark one done when the room kept it.</p>
      </PageIntro>
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <CompanionSelect value={slug} onChange={setSlug} />
        <select
          value={keeper}
          onChange={(event) => setKeeper(event.target.value as "you" | "them")}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          <option value="them">They promised</option>
          <option value="you">You promised</option>
        </select>
        <Input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Tea tomorrow." />
        <Button type="submit">Keep promise</Button>
      </form>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="rounded-2xl bg-card px-4 py-3 text-left ring-1 ring-border"
            onClick={() => {
              void fetch("/api/promises", {
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
            <p className="mt-1 text-xs text-muted-foreground">
              {item.slug} · {item.keeper === "them" ? "they keep it" : "you keep it"}
            </p>
          </button>
        ))}
      </div>
    </main>
  );
}
