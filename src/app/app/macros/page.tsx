"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Macro = { id: string; title: string; content: string };

export default function MacrosPage() {
  const [macros, setMacros] = useState<Macro[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    void fetch("/api/macros")
      .then((response) => response.json())
      .then((payload: { macros?: Macro[] }) => setMacros(payload.macros ?? []));
  }, []);

  async function add() {
    const response = await fetch("/api/macros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content }),
    });
    const payload = (await response.json()) as { macro?: Macro; error?: string };
    if (!response.ok || !payload.macro) {
      toast.error(payload.error ?? "Could not save");
      return;
    }
    setMacros((current) => [payload.macro!, ...current]);
    setTitle("");
    setContent("");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Macros" title="Lines you say often">
        <p>Save a phrase. In chat it shows up as a chip you can send in one tap.</p>
      </PageIntro>
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Name" />
        <Textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="I'm home." />
        <Button type="submit">Save macro</Button>
      </form>
      <div className="flex flex-col gap-2">
        {macros.map((macro) => (
          <div key={macro.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-sm font-medium">{macro.title}</p>
            <p className="text-sm text-muted-foreground">{macro.content}</p>
            <button
              type="button"
              className="mt-2 text-xs text-muted-foreground hover:underline"
              onClick={() => {
                void fetch("/api/macros", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: macro.id }),
                }).then(() => setMacros((current) => current.filter((item) => item.id !== macro.id)));
              }}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
