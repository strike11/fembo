"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function PlusActions({
  plus,
  stripeReady,
  canDevUnlock,
  hasCustomer,
}: {
  plus: boolean;
  stripeReady: boolean;
  canDevUnlock: boolean;
  hasCustomer: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<"checkout" | "portal" | "unlock" | null>(null);

  async function start(path: string, kind: "checkout" | "portal" | "unlock") {
    setPending(kind);
    const response = await fetch(path, { method: "POST" });
    const payload = (await response.json()) as { url?: string; error?: string };
    setPending(null);
    if (!response.ok) {
      toast.error(payload.error ?? "Could not start billing");
      return;
    }
    if (payload.url) {
      window.location.href = payload.url;
      return;
    }
    toast.success("Plus is on");
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {plus ? (
        hasCustomer ? (
          <Button
            type="button"
            variant="outline"
            disabled={pending !== null}
            onClick={() => void start("/api/billing/portal", "portal")}
          >
            {pending === "portal" ? <Spinner /> : null}
            Manage billing
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">Plus is active on this account.</p>
        )
      ) : (
        <Button
          type="button"
          disabled={pending !== null || !stripeReady}
          onClick={() => void start("/api/billing/checkout", "checkout")}
        >
          {pending === "checkout" ? <Spinner /> : null}
          Subscribe · $5.99 / month
        </Button>
      )}
      {canDevUnlock && !plus ? (
        <Button
          type="button"
          variant="secondary"
          disabled={pending !== null}
          onClick={() => void start("/api/billing/dev-unlock", "unlock")}
        >
          {pending === "unlock" ? <Spinner /> : null}
          Unlock locally
        </Button>
      ) : null}
    </div>
  );
}
