"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function SupportForm() {
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");

  async function send() {
    const response = await fetch("/api/abuse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, body, href: window.location.pathname }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      toast.error(payload.error ?? "Could not send that");
      return;
    }
    setBody("");
    toast.success("We have the note. Thank you.");
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
      onSubmit={(event) => {
        event.preventDefault();
        void send();
      }}
    >
      <Input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email (optional)"
      />
      <Textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={5}
        placeholder="What happened? Include the companion name if you can."
      />
      <Button type="submit">Send report</Button>
    </form>
  );
}
