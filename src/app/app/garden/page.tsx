"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CompanionSelect } from "@/components/companion-select";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { plantThirsty } from "@/lib/keeps";

type Plant = { id: string; slug: string; name: string; wateredDay: string; streak: number };

export default function GardenPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [today, setToday] = useState("");
  const [slug, setSlug] = useState("aki");

  useEffect(() => {
    void fetch("/api/garden")
      .then((response) => response.json())
      .then((payload: { plants?: Plant[]; today?: string }) => {
        setPlants(payload.plants ?? []);
        setToday(payload.today ?? "");
      });
  }, []);

  async function act(action: "plant" | "water") {
    const response = await fetch("/api/garden", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, action }),
    });
    const payload = (await response.json()) as { plant?: Plant; already?: boolean; error?: string };
    if (!response.ok || !payload.plant) {
      toast.error(payload.error ?? "The plant stayed still");
      return;
    }
    setPlants((current) => {
      const rest = current.filter((item) => item.id !== payload.plant!.id);
      return [...rest, payload.plant!];
    });
    toast.success(payload.already ? "Already watered today" : action === "plant" ? "It has a place" : "Watered");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Garden" title="Something living on the sill">
        <p>One plant each. Water once a day. Miss a day and the streak starts over, gently.</p>
      </PageIntro>
      <div className="flex flex-wrap items-center gap-2">
        <CompanionSelect value={slug} onChange={setSlug} />
        <Button type="button" onClick={() => void act("plant")}>
          Plant
        </Button>
        <Button type="button" variant="outline" onClick={() => void act("water")}>
          Water
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {plants.map((plant) => (
          <article key={plant.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-sm font-medium">{plant.name}</p>
            <p className="text-sm text-muted-foreground">
              Streak {plant.streak} · {plantThirsty(plant.wateredDay, today || undefined) ? "thirsty" : "fine today"}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
