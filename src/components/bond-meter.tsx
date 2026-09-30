import type { BondLevel } from "@/lib/bond";

export function BondMeter({ bond }: { bond: BondLevel }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">{bond.label}</span>
        <span className="text-muted-foreground">{bond.score}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${bond.score}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">{bond.hint}</p>
    </div>
  );
}
