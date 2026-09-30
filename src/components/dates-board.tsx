"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Plan = {
  id: string;
  slug: string;
  title: string;
  whenLabel: string;
  notes: string;
  createdAt: string;
};

export function DatesBoard({ initial }: { initial: Plan[] }) {
  const [plans, setPlans] = useState(initial);
  const [slug, setSlug] = useState("aki");
  const [title, setTitle] = useState("");
  const [whenLabel, setWhenLabel] = useState("Friday night");
  const [notes, setNotes] = useState("");

  async function add() {
    const response = await fetch("/api/dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, title, whenLabel, notes }),
    });
    const payload = (await response.json()) as { plan?: Plan; error?: string };
    if (!response.ok || !payload.plan) {
      toast.error(payload.error ?? "Could not plan that");
      return;
    }
    setPlans((current) => [payload.plan!, ...current]);
    setTitle("");
    setNotes("");
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-col gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <CompanionSelect value={slug} onChange={setSlug} />
        <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Tea on the floor" />
        <Input value={whenLabel} onChange={(event) => setWhenLabel(event.target.value)} placeholder="When" />
        <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} placeholder="Optional notes" />
        <Button type="submit">Plan a night</Button>
      </form>
      {plans.map((plan) => (
        <article key={plan.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
          <p className="text-sm font-medium">{plan.title}</p>
          <p className="text-sm text-muted-foreground">
            {plan.slug} · {plan.whenLabel}
          </p>
          {plan.notes ? <p className="mt-1 text-sm">{plan.notes}</p> : null}
        </article>
      ))}
    </div>
  );
}
