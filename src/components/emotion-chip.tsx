import { EmotionIcon } from "@/components/emotion-icon";
import type { EmotionId } from "@/lib/emotions";
import { cn } from "@/lib/utils";

export function EmotionChip({
  id,
  label,
  surface = "default",
}: {
  id: EmotionId;
  label: string;
  tone?: "assistant" | "user";
  surface?: "default" | "onDark";
}) {
  const onDark = surface === "onDark";
  return (
    <span
      className={cn(
        "inline-flex items-center align-middle",
        onDark
          ? "h-6 gap-1 rounded-full border border-white/25 bg-white/12 px-1.5 text-white"
          : "h-8 gap-1.5 rounded-md border border-border bg-muted px-1.5 text-foreground",
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center",
          onDark
            ? "size-4 rounded-full bg-white/15 text-white"
            : "size-6 rounded-sm bg-background text-foreground",
        )}
      >
        <EmotionIcon id={id} />
      </span>
      <span aria-hidden className={onDark ? "text-white/45" : "text-muted-foreground"}>
        |
      </span>
      <span className={cn("pr-1 font-medium lowercase", onDark ? "text-[10px] text-white" : "text-xs")}>
        {label}
      </span>
    </span>
  );
}
