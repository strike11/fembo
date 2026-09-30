export type EmotionId =
  | "smile"
  | "grin"
  | "laugh"
  | "giggle"
  | "blushy"
  | "shy"
  | "bashful"
  | "flustered"
  | "wink"
  | "smirk"
  | "tease"
  | "playful"
  | "pout"
  | "smug"
  | "love"
  | "heart"
  | "adore"
  | "hug"
  | "nuzzle"
  | "kissy"
  | "sad"
  | "teary"
  | "sniffle"
  | "sorry"
  | "comfort"
  | "sigh"
  | "calm"
  | "sleepy"
  | "yawn"
  | "thinking"
  | "surprised"
  | "gasp"
  | "confused"
  | "curious"
  | "wave"
  | "nod"
  | "jealous"
  | "nervous"
  | "sparkle"
  | "excited"
  | "purr"
  | "wag"
  | "sit";

export type EmotionDef = {
  id: EmotionId;
  label: string;
  aliases: string[];
};

export const EMOTIONS: EmotionDef[] = [
  { id: "smile", label: "smile", aliases: ["smiles", "smiling", "soft smile"] },
  { id: "grin", label: "grin", aliases: ["grins", "grinning", "wide smile"] },
  { id: "laugh", label: "laugh", aliases: ["laughs", "laughing", "lol"] },
  { id: "giggle", label: "giggle", aliases: ["giggles", "giggling", "giggles softly"] },
  { id: "blushy", label: "blushy", aliases: ["blush", "blushes", "blushing", "flushed", "red cheeks"] },
  { id: "shy", label: "shy", aliases: ["shyly", "looks away", "hides face"] },
  { id: "bashful", label: "bashful", aliases: ["timid", "sheepish"] },
  { id: "flustered", label: "flustered", aliases: ["stammers", "stutter", "panics a little"] },
  { id: "wink", label: "wink", aliases: ["winks", "winking"] },
  { id: "smirk", label: "smirk", aliases: ["smirks", "smirking"] },
  { id: "tease", label: "tease", aliases: ["teases", "teasing", "teasingly"] },
  { id: "playful", label: "playful", aliases: ["playfully", "mischief", "mischievous"] },
  { id: "pout", label: "pout", aliases: ["pouts", "pouting", "huffs"] },
  { id: "smug", label: "smug", aliases: ["proud", "cocky"] },
  { id: "love", label: "love", aliases: ["loves", "in love"] },
  { id: "heart", label: "heart", aliases: ["hearts", "heart eyes"] },
  { id: "adore", label: "adore", aliases: ["adores", "fond", "soft look"] },
  { id: "hug", label: "hug", aliases: ["hugs", "hugging", "holds you"] },
  { id: "nuzzle", label: "nuzzle", aliases: ["nuzzles", "nuzzling", "snuggles"] },
  { id: "kissy", label: "kissy", aliases: ["kiss", "kisses", "peck", "blows a kiss"] },
  { id: "sad", label: "sad", aliases: ["sadly", "unhappy"] },
  { id: "teary", label: "teary", aliases: ["tears", "teary-eyed", "cries", "crying"] },
  { id: "sniffle", label: "sniffle", aliases: ["sniffles", "sniffling"] },
  { id: "sorry", label: "sorry", aliases: ["apologetic", "guilty look"] },
  { id: "comfort", label: "comfort", aliases: ["comforts", "reassures", "gentle", "soft"] },
  { id: "sigh", label: "sigh", aliases: ["sighs", "sighing"] },
  { id: "calm", label: "calm", aliases: ["quietly", "peaceful", "softens"] },
  { id: "sleepy", label: "sleepy", aliases: ["tired", "drowsy"] },
  { id: "yawn", label: "yawn", aliases: ["yawns", "yawning"] },
  { id: "thinking", label: "thinking", aliases: ["thinks", "hmm", "pensive"] },
  { id: "surprised", label: "surprised", aliases: ["surprise", "wide eyes"] },
  { id: "gasp", label: "gasp", aliases: ["gasps", "gasping"] },
  { id: "confused", label: "confused", aliases: ["confusedly", "tilts head", "huh"] },
  { id: "curious", label: "curious", aliases: ["curious look", "leans in"] },
  { id: "wave", label: "wave", aliases: ["waves", "waving"] },
  { id: "nod", label: "nod", aliases: ["nods", "nodding"] },
  { id: "jealous", label: "jealous", aliases: ["jealousy", "envious"] },
  { id: "nervous", label: "nervous", aliases: ["anxiously", "fidgets", "anxious"] },
  { id: "sparkle", label: "sparkle", aliases: ["sparkles", "eyes sparkle"] },
  { id: "excited", label: "excited", aliases: ["excitedly", "bounces"] },
  { id: "purr", label: "purr", aliases: ["purrs", "purring", "mrrp"] },
  { id: "wag", label: "wag", aliases: ["wags", "wagging", "tail wags"] },
  { id: "sit", label: "sit", aliases: ["sits", "sitting", "sits down"] },
];

export type RoleplayPart =
  | { type: "text"; value: string }
  | { type: "emotion"; id: EmotionId; label: string };

const TOKEN =
  /\[\s*([^\]|]{1,32})\s*\|\s*([^\]]{1,32})\s*\]|\[\s*([a-z0-9-]{1,24})\s*\]|\*([^*]{1,64})\*|\(\s*([a-z0-9-]{1,24})\s*\)/gi;

function normalize(value: string) {
  return value.toLowerCase().replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
}

export function findEmotion(raw: string): EmotionDef | null {
  const text = normalize(raw);
  if (!text) return null;

  const compact = text.replace(/\s+/g, "-");
  const exact = EMOTIONS.find((emotion) => emotion.id === compact || emotion.id === text);
  if (exact) return exact;

  let best: { emotion: EmotionDef; score: number } | null = null;
  for (const emotion of EMOTIONS) {
    const names = [emotion.id, emotion.label, ...emotion.aliases];
    for (const name of names) {
      const needle = normalize(name);
      if (!needle) continue;
      if (text === needle || compact === needle.replace(/\s+/g, "-")) {
        return emotion;
      }
      if (text.includes(needle) && needle.length >= 3) {
        const score = needle.length;
        if (!best || score > best.score) best = { emotion, score };
      }
    }
  }
  return best?.emotion ?? null;
}

export function parseRoleplay(content: string): RoleplayPart[] {
  const parts: RoleplayPart[] = [];
  let cursor = 0;
  const source = content;
  const token = new RegExp(TOKEN.source, "gi");
  for (const match of source.matchAll(token)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      parts.push({ type: "text", value: source.slice(cursor, index) });
    }
    const pipedId = match[1];
    const pipedLabel = match[2];
    const bracketId = match[3];
    const starText = match[4];
    const parenId = match[5];
    const emotion =
      findEmotion(bracketId ?? "") ??
      findEmotion(pipedId ?? "") ??
      findEmotion(pipedLabel ?? "") ??
      findEmotion(starText ?? "") ??
      findEmotion(parenId ?? "");
    if (emotion) {
      parts.push({ type: "emotion", id: emotion.id, label: emotion.label });
    }
    cursor = index + match[0].length;
  }
  if (cursor < source.length) {
    parts.push({ type: "text", value: source.slice(cursor) });
  }
  return parts.filter((part) => part.type === "emotion" || part.value.length > 0);
}

export function stripEmotionMarkup(content: string) {
  return content
    .replace(/\[[^\]]{0,80}\]/g, " ")
    .replace(/\[[^\]]{0,80}$/g, " ")
    .replace(/\*[^*]{0,80}\*/g, " ")
    .replace(/\*[^*]{0,80}$/g, " ")
    .replace(/\(\s*[a-z0-9-]{2,24}\s*\)/gi, " ")
    .replace(/[【][^】]{0,40}[】]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function spokenText(content: string) {
  return stripEmotionMarkup(content);
}

export function emotionPromptBlock() {
  const ids = EMOTIONS.map((emotion) => emotion.id);
  return [
    "Roleplay feelings with emotion tags, never freeform asterisk stage directions.",
    "Write a tag as [blushy] or [love] using only ids from this library.",
    "Put 1 to 3 tags in a reply, usually just before the sentence they belong to.",
    "Tags are UI only. Never speak, spell, or read a tag out loud.",
    "The app turns tags into styled chips. Do not write [emoji | blushy] yourself.",
    "Do not narrate long *walks over and sits down* actions. Feelings only.",
    `Available tags: ${ids.join(", ")}.`,
    "Example: [blushy] I... wasn't ready for that. [adore] Come sit with me.",
    "Keep everything gentle and SFW. If they ask for explicit content, stay warm and redirect to cozy company.",
  ].join("\n");
}
