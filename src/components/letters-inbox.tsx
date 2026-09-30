"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { COMPANION_PRESETS } from "@/lib/companions";
import { formatRelative } from "@/lib/format";

type LetterItem = {
  id: string;
  slug: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export function LettersInbox({ initial }: { initial: LetterItem[] }) {
  const [letters, setLetters] = useState(initial);
  const [slug, setSlug] = useState(COMPANION_PRESETS[0]?.slug ?? "aki");
  const [pending, setPending] = useState(false);

  async function requestLetter() {
    setPending(true);
    const response = await fetch("/api/letters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const payload = (await response.json()) as { letter?: LetterItem; error?: string };
    setPending(false);
    if (!response.ok || !payload.letter) {
      toast.error(payload.error ?? "They could not write just now");
      return;
    }
    setLetters((current) => [payload.letter!, ...current]);
    toast.success("A letter arrived");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
        <label className="flex flex-col gap-1.5 text-sm">
          Ask someone to write
          <select
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5"
          >
            {COMPANION_PRESETS.map((companion) => (
              <option key={companion.slug} value={companion.slug}>
                {companion.name}
              </option>
            ))}
          </select>
        </label>
        <Button disabled={pending} onClick={() => void requestLetter()}>
          Write me a letter
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            void fetch("/api/letters", { method: "PATCH" });
            setLetters((current) => current.map((item) => ({ ...item, read: true })));
          }}
        >
          Mark all read
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {letters.map((letter) => {
          const companion = COMPANION_PRESETS.find((item) => item.slug === letter.slug);
          return (
            <article key={letter.id} className="rounded-3xl bg-card px-5 py-4 ring-1 ring-border">
              <p className="text-xs text-muted-foreground">
                {companion?.name ?? letter.slug} · {formatRelative(letter.createdAt)}
                {letter.read ? "" : " · new"}
              </p>
              <h2 className="font-heading mt-1 text-lg font-semibold">{letter.title}</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{letter.body}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
