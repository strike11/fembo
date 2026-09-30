"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { COMPANION_PRESETS } from "@/lib/companions";
import { RITUALS } from "@/lib/rituals";

export function RitualsBoard({ done }: { done: string[] }) {
  const router = useRouter();
  const [finished, setFinished] = useState(done);
  const [slug, setSlug] = useState(COMPANION_PRESETS[0]?.slug ?? "aki");
  const [pending, setPending] = useState<string | null>(null);

  async function start(key: string) {
    setPending(key);
    const response = await fetch("/api/rituals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, slug }),
    });
    const payload = (await response.json()) as { line?: string; scene?: string; error?: string };
    setPending(null);
    if (!response.ok) {
      toast.error(payload.error ?? "Could not start that");
      return;
    }
    setFinished((current) => (current.includes(key) ? current : [...current, key]));
    const params = new URLSearchParams();
    if (payload.scene) params.set("scene", payload.scene);
    if (payload.line) params.set("say", payload.line);
    router.push(`/app/companions/${slug}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-5">
      <label className="flex max-w-xs flex-col gap-1.5 text-sm">
        With
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
      <div className="grid gap-3 sm:grid-cols-2">
        {RITUALS.map((ritual) => {
          const complete = finished.includes(ritual.key);
          return (
            <div key={ritual.key} className="rounded-2xl bg-card p-4 ring-1 ring-border">
              <p className="text-sm font-medium">{ritual.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">{ritual.hint}</p>
              <Button
                className="mt-3"
                size="sm"
                variant={complete ? "secondary" : "default"}
                disabled={pending === ritual.key}
                onClick={() => void start(ritual.key)}
              >
                {complete ? "Again" : "Begin"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
