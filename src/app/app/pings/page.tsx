"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { COMPANION_PRESETS } from "@/lib/companions";
import { formatRelative } from "@/lib/format";

type Ping = { id: string; slug: string; reply: string; createdAt: string };

export default function PingsPage() {
  const [pings, setPings] = useState<Ping[]>([]);
  const [slug, setSlug] = useState("aki");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/pings")
      .then((response) => response.json())
      .then((payload: { pings?: Ping[] }) => setPings(payload.pings ?? []));
  }, []);

  async function send() {
    setBusy(true);
    const response = await fetch("/api/pings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    const payload = (await response.json()) as { ping?: Ping; error?: string };
    setBusy(false);
    if (!response.ok || !payload.ping) {
      toast.error(payload.error ?? "They did not hear it");
      return;
    }
    setPings((current) => [payload.ping!, ...current]);
    toast.success(payload.ping.reply);
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Miss you" title="A tap when you want them close">
        <p>They answer in one sentence. No chat thread required.</p>
      </PageIntro>
      <div className="flex flex-wrap items-center gap-2">
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
        <Button type="button" disabled={busy} onClick={() => void send()}>
          {busy ? "Sending…" : "I miss you"}
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {pings.map((ping) => (
          <article key={ping.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">
              {ping.slug} · {formatRelative(ping.createdAt)}
            </p>
            <p className="mt-1 text-sm">{ping.reply}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
