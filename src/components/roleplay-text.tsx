import { EmotionChip } from "@/components/emotion-chip";
import { parseRoleplay } from "@/lib/emotions";

export function RoleplayText({
  content,
  tone = "assistant",
  onDark = false,
}: {
  content: string;
  tone?: "assistant" | "user";
  onDark?: boolean;
}) {
  const visible = content.replace(/\[[^\]]*$/, "").replace(/\*[^*]*$/, "");
  const parts = parseRoleplay(visible);

  return (
    <div className={onDark ? "text-sm leading-5 text-white" : "text-[15px] leading-7"}>
      {parts.map((part, index) =>
        part.type === "emotion" ? (
          <span key={`${part.id}-${index}`} className="mx-0.5 inline-flex align-middle">
            <EmotionChip
              id={part.id}
              label={part.label}
              tone={tone}
              surface={onDark ? "onDark" : "default"}
            />
          </span>
        ) : (
          <span key={`text-${index}`} className="whitespace-pre-wrap">
            {part.value}
          </span>
        ),
      )}
    </div>
  );
}
