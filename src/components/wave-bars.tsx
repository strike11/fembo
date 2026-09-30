import { cn } from "@/lib/utils";

export function WaveBars({
  active,
  className,
}: {
  active: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex h-8 items-end justify-center gap-1", className)} aria-hidden>
      {Array.from({ length: 7 }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "w-1 rounded-full bg-primary/80",
            active ? "wave-bar" : "h-2 opacity-40",
          )}
          style={{ animationDelay: `${index * 90}ms` }}
        />
      ))}
    </div>
  );
}
