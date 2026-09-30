"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ErrorFallback({
  title,
  detail,
  retry,
}: {
  title: string;
  detail?: string;
  retry: () => void;
}) {
  const [sent, setSent] = useState(false);

  async function report() {
    try {
      await fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: title,
          digest: detail,
          href: window.location.pathname,
        }),
      });
    } catch {
      /* offline */
    }
    setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-[50vh] w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm text-muted-foreground">The room stumbled</p>
      <h1 className="font-heading text-2xl font-semibold">{title}</h1>
      {detail ? <p className="text-sm text-muted-foreground">Ref {detail}</p> : null}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" onClick={() => retry()}>
          Try again
        </Button>
        {sent ? (
          <p className="text-sm text-muted-foreground">Crash note sent</p>
        ) : (
          <Button type="button" variant="outline" onClick={() => void report()}>
            Send a crash note
          </Button>
        )}
      </div>
    </main>
  );
}
