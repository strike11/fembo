"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRelative } from "@/lib/format";
import { asLocale, t } from "@/lib/i18n";

type MemoryRow = { id: string; slug: string; content: string; createdAt: string };
type SimpleRow = { id: string; content: string };

export function CompanionCarePanel({
  slug,
  locale = "en",
  initialMemories,
}: {
  slug: string;
  locale?: string;
  initialMemories: MemoryRow[];
}) {
  const lang = asLocale(locale);
  const [memories, setMemories] = useState(initialMemories);
  const [memoryDraft, setMemoryDraft] = useState("");
  const [boundaries, setBoundaries] = useState<SimpleRow[]>([]);
  const [comfortNotes, setComfortNotes] = useState<SimpleRow[]>([]);
  const [boundaryDraft, setBoundaryDraft] = useState("");
  const [comfortDraft, setComfortDraft] = useState("");

  useEffect(() => {
    void Promise.all([
      fetch("/api/boundaries").then((response) => response.json()),
      fetch("/api/comfort-notes").then((response) => response.json()),
    ]).then(([boundariesPayload, comfortPayload]) => {
      setBoundaries((boundariesPayload as { boundaries?: SimpleRow[] }).boundaries ?? []);
      setComfortNotes((comfortPayload as { notes?: SimpleRow[] }).notes ?? []);
    });
  }, []);

  async function addMemory() {
    const text = memoryDraft.trim();
    if (text.length < 3) return;
    const response = await fetch("/api/memories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, content: text }),
    });
    const payload = (await response.json()) as { memory?: MemoryRow; error?: string };
    if (!response.ok || !payload.memory) {
      toast.error(payload.error ?? t(lang, "errorSendFailed"));
      return;
    }
    setMemories((current) => [payload.memory!, ...current]);
    setMemoryDraft("");
  }

  async function addBoundary() {
    const response = await fetch("/api/boundaries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: boundaryDraft }),
    });
    const payload = (await response.json()) as { boundary?: SimpleRow; error?: string };
    if (!response.ok || !payload.boundary) {
      toast.error(payload.error ?? t(lang, "errorSendFailed"));
      return;
    }
    setBoundaries((current) => [payload.boundary!, ...current]);
    setBoundaryDraft("");
  }

  async function addComfortNote() {
    const response = await fetch("/api/comfort-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: comfortDraft }),
    });
    const payload = (await response.json()) as { note?: SimpleRow; error?: string };
    if (!response.ok || !payload.note) {
      toast.error(payload.error ?? t(lang, "errorSendFailed"));
      return;
    }
    setComfortNotes((current) => [payload.note!, ...current]);
    setComfortDraft("");
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">{t(lang, "memories")}</h2>
          <p className="text-sm text-muted-foreground">{t(lang, "memoriesHint")}</p>
        </div>
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void addMemory();
          }}
        >
          <Input
            value={memoryDraft}
            onChange={(event) => setMemoryDraft(event.target.value)}
            placeholder={t(lang, "memoryPlaceholder")}
            aria-label={t(lang, "memories")}
          />
          <Button type="submit">{t(lang, "addMemory")}</Button>
        </form>
        <div className="flex flex-col gap-2">
          {memories.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t(lang, "noChatsYet")}</p>
          ) : (
            memories.map((item) => (
              <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
                <p className="text-sm">{item.content}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatRelative(item.createdAt)}</p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">{t(lang, "boundaries")}</h2>
          <p className="text-sm text-muted-foreground">{t(lang, "boundariesHint")}</p>
        </div>
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void addBoundary();
          }}
        >
          <Input
            value={boundaryDraft}
            onChange={(event) => setBoundaryDraft(event.target.value)}
            aria-label={t(lang, "boundaries")}
          />
          <Button type="submit">{t(lang, "keepBoundary")}</Button>
        </form>
        <div className="flex flex-col gap-2">
          {boundaries.map((item) => (
            <article
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-border"
            >
              <p className="text-sm">{item.content}</p>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                onClick={() => {
                  void fetch("/api/boundaries", {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: item.id }),
                  }).then(() => setBoundaries((current) => current.filter((row) => row.id !== item.id)));
                }}
              >
                {t(lang, "remove")}
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">{t(lang, "comfort")}</h2>
          <p className="text-sm text-muted-foreground">{t(lang, "comfortHint")}</p>
        </div>
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            void addComfortNote();
          }}
        >
          <Input
            value={comfortDraft}
            onChange={(event) => setComfortDraft(event.target.value)}
            aria-label={t(lang, "comfort")}
          />
          <Button type="submit">{t(lang, "keepComfort")}</Button>
        </form>
        <div className="flex flex-col gap-2">
          {comfortNotes.map((item) => (
            <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
              <p className="text-sm">{item.content}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
