"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function HandshakePage() {
  const [phrase, setPhrase] = useState("");

  useEffect(() => {
    void fetch("/api/handshake")
      .then((response) => response.json())
      .then((payload: { handshake?: { phrase: string } | null }) => {
        if (payload.handshake?.phrase) setPhrase(payload.handshake.phrase);
      });
  }, []);

  async function save() {
    const response = await fetch("/api/handshake", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phrase }),
    });
    if (!response.ok) {
      toast.error("Could not keep the phrase");
      return;
    }
    toast.success("They will know it");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Handshake" title="A private phrase">
        <p>Say it in chat. They say it back, then stay close. Keep it short. Keep it yours.</p>
      </PageIntro>
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <Input value={phrase} onChange={(event) => setPhrase(event.target.value)} placeholder="I'm home, really" />
        <Button type="submit">Save handshake</Button>
      </form>
    </main>
  );
}
