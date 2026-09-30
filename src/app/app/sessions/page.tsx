"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageIntro } from "@/components/page-intro";
import { Button } from "@/components/ui/button";
import { formatRelative } from "@/lib/format";

type Row = {
  id: string;
  updatedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
};

export default function SessionsPage() {
  const [currentId, setCurrentId] = useState("");
  const [sessions, setSessions] = useState<Row[]>([]);

  async function load() {
    const response = await fetch("/api/sessions");
    const payload = (await response.json()) as { currentId?: string; sessions?: Row[] };
    setCurrentId(payload.currentId ?? "");
    setSessions(payload.sessions ?? []);
  }

  useEffect(() => {
    let active = true;
    void fetch("/api/sessions")
      .then((response) => response.json())
      .then((payload: { currentId?: string; sessions?: Row[] }) => {
        if (!active) return;
        setCurrentId(payload.currentId ?? "");
        setSessions(payload.sessions ?? []);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  async function revoke(id?: string, others = false) {
    const response = await fetch("/api/sessions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(others ? { others: true } : { id }),
    });
    if (!response.ok) {
      toast.error("Could not revoke that");
      return;
    }
    toast.success("Revoked");
    void load();
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Sessions" title="Where you are signed in">
        <p>Revoke a laptop you no longer have. This device stays until you sign out.</p>
      </PageIntro>
      <Button type="button" variant="outline" onClick={() => void revoke(undefined, true)}>
        Sign out other devices
      </Button>
      <div className="flex flex-col gap-2">
        {sessions.map((item) => (
          <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-sm font-medium">{item.id === currentId ? "This device" : "Another device"}</p>
            <p className="text-xs text-muted-foreground">
              {item.ipAddress ?? "unknown ip"} · {formatRelative(item.updatedAt)}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">{item.userAgent ?? "unknown agent"}</p>
            {item.id !== currentId ? (
              <button
                type="button"
                className="mt-2 text-xs text-muted-foreground hover:underline"
                onClick={() => void revoke(item.id)}
              >
                Revoke
              </button>
            ) : null}
          </article>
        ))}
      </div>
    </main>
  );
}
