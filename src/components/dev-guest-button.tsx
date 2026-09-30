"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function DevGuestButton({
  variant = "outline",
  size = "default",
  className,
}: {
  variant?: "outline" | "secondary" | "ghost";
  size?: "default" | "lg";
  className?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enter() {
    setError(null);
    setPending(true);
    const response = await fetch("/api/dev/guest", { method: "POST" });
    setPending(false);
    if (!response.ok) {
      setError("Не получилось войти без аккаунта");
      return;
    }
    router.push("/app");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant={variant} size={size} className={className} disabled={pending} onClick={() => void enter()}>
        {pending ? <Spinner data-icon="inline-start" /> : null}
        Войти без аккаунта
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
