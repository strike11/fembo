"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { COMPANION_PRESETS } from "@/lib/companions";
import { formatRelative } from "@/lib/format";

type Note = { id: string; slug: string; content: string; createdAt: string };

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [slug, setSlug] = useState("aki");
  const [content, setContent] = useState("");

  useEffect(() => {
    void fetch("/api/notes")
      .then((response) => response.json())
      .then((payload: { notes?: Note[] }) => setNotes(payload.notes ?? []));
  }, []);

  async function add() {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, content }),
    });
    const payload = (await response.json()) as { note?: Note; error?: string };
    if (!response.ok || !payload.note) {
      toast.error(payload.error ?? "Could not save");
      return;
    }
    setNotes((current) => [payload.note!, ...current]);
    setContent("");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Notes" title="Private, just for you">
        <p>They do not see these. A place to remember how someone makes you feel.</p>
      </PageIntro>
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <select
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        >
          {COMPANION_PRESETS.map((companion) => (
            <option key={companion.slug} value={companion.slug}>
              {companion.name}
            </option>
          ))}
        </select>
        <Textarea value={content} onChange={(event) => setContent(event.target.value)} rows={3} />
        <Button type="submit">Keep note</Button>
      </form>
      <div className="flex flex-col gap-2">
        {notes.map((note) => (
          <article key={note.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">
              {note.slug} · {formatRelative(note.createdAt)}
            </p>
            <p className="mt-1 text-sm">{note.content}</p>
            <button
              type="button"
              className="mt-2 text-xs text-muted-foreground hover:underline"
              onClick={() => {
                void fetch("/api/notes", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: note.id }),
                }).then(() => setNotes((current) => current.filter((item) => item.id !== note.id)));
              }}
            >
              Forget this
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
