import { COMPANION_PRESETS } from "@/lib/companions";

export function CompanionSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (slug: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
    >
      {COMPANION_PRESETS.map((companion) => (
        <option key={companion.slug} value={companion.slug}>
          {companion.name}
        </option>
      ))}
    </select>
  );
}
