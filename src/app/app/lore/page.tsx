"use client";

import { useEffect, useState } from "react";
import { PageIntro } from "@/components/page-intro";

type Secret = { key: string; title: string; body: string; need: number; open: boolean };
type Row = { slug: string; name: string; secrets: Secret[] };

export default function LorePage() {
  const [catalog, setCatalog] = useState<Row[]>([]);

  useEffect(() => {
    void fetch("/api/lore")
      .then((response) => response.json())
      .then((payload: { catalog?: Row[] }) => setCatalog(payload.catalog ?? []));
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Secrets" title="What they tell you later">
        <p>Talk more and the drawers open. Nothing here is for anyone under 21.</p>
      </PageIntro>
      {catalog.map((row) => (
        <section key={row.slug} className="flex flex-col gap-2">
          <h2 className="font-heading text-lg font-semibold">{row.name}</h2>
          {row.secrets.map((secret) => (
            <article
              key={secret.key}
              className={`rounded-2xl px-4 py-3 ring-1 ${secret.open ? "bg-card ring-border" : "bg-muted/40 ring-transparent opacity-70"}`}
            >
              <p className="text-sm font-medium">{secret.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {secret.open ? secret.body : `Locked until ${secret.need} messages together.`}
              </p>
            </article>
          ))}
        </section>
      ))}
    </main>
  );
}
