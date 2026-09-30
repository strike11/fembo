"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { GIFTS } from "@/lib/gifts";

export function GiftTray({ slug }: { slug: string }) {
  const [pending, setPending] = useState<string | null>(null);

  async function send(kind: string) {
    setPending(kind);
    const response = await fetch("/api/gifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, kind }),
    });
    const payload = (await response.json()) as { thanks?: string; error?: string };
    setPending(null);
    if (!response.ok) {
      toast.error(payload.error ?? "Could not send that");
      return;
    }
    toast.success(payload.thanks ?? "They took it");
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {GIFTS.map((gift) => (
        <Button
          key={gift.id}
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending === gift.id}
          onClick={() => void send(gift.id)}
        >
          <span aria-hidden>{gift.emoji}</span>
          {gift.label}
        </Button>
      ))}
    </div>
  );
}
