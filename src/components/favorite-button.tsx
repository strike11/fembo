"use client";

import { HeartIcon } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  slug,
  initial,
  className,
}: {
  slug: string;
  initial: boolean;
  className?: string;
}) {
  const [favored, setFavored] = useState(initial);

  async function toggle(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const previous = favored;
    setFavored(!previous);
    const response = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (!response.ok) {
      setFavored(previous);
      toast.error("Could not update favorites");
      return;
    }
    const payload = (await response.json()) as { favored?: boolean };
    setFavored(payload.favored ?? !previous);
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon-sm"
      aria-label={favored ? "Remove favorite" : "Add favorite"}
      className={cn(className)}
      onClick={toggle}
    >
      <HeartIcon className={cn(favored && "fill-primary text-primary")} />
    </Button>
  );
}
