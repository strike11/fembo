import type { EmotionId } from "@/lib/emotions";
import { parseRoleplay } from "@/lib/emotions";
import { resolveAssetDir, resolveAssetUrl } from "@/lib/storage";

export const SPRITE_IDS = [
  "smile",
  "blushy",
  "shy",
  "grin",
  "wink",
  "love",
  "kissy",
  "sad",
  "sleepy",
  "surprised",
  "thinking",
  "tease",
  "wave",
  "hug",
  "sit",
  "smug",
] as const;

export type SpriteId = (typeof SPRITE_IDS)[number];

const EMOTION_SPRITE: Record<EmotionId, SpriteId> = {
  smile: "smile",
  grin: "grin",
  laugh: "grin",
  giggle: "grin",
  blushy: "blushy",
  shy: "shy",
  bashful: "shy",
  flustered: "blushy",
  wink: "wink",
  smirk: "tease",
  tease: "tease",
  playful: "grin",
  pout: "shy",
  smug: "smug",
  love: "love",
  heart: "love",
  adore: "love",
  hug: "hug",
  nuzzle: "hug",
  kissy: "kissy",
  sad: "sad",
  teary: "sad",
  sniffle: "sad",
  sorry: "sad",
  comfort: "smile",
  sigh: "sleepy",
  calm: "smile",
  sleepy: "sleepy",
  yawn: "sleepy",
  thinking: "thinking",
  surprised: "surprised",
  gasp: "surprised",
  confused: "thinking",
  curious: "thinking",
  wave: "wave",
  nod: "smile",
  jealous: "sad",
  nervous: "shy",
  sparkle: "love",
  excited: "grin",
  purr: "love",
  wag: "grin",
  sit: "sit",
};

export function isSpriteId(value: string): value is SpriteId {
  return (SPRITE_IDS as readonly string[]).includes(value);
}

export function spriteDir(slug: string, avatarPath?: string) {
  if (
    avatarPath &&
    (avatarPath.startsWith("/custom/") ||
      avatarPath.startsWith("s3://") ||
      avatarPath.startsWith("custom/") ||
      /^https?:\/\//i.test(avatarPath))
  ) {
    return resolveAssetDir(avatarPath);
  }
  return `/companions/${slug}`;
}

export function spriteFile(slug: string, sprite: SpriteId, avatarPath?: string) {
  const dir = spriteDir(slug, avatarPath);
  return resolveAssetUrl(`${dir}/${sprite}.png`);
}

export function defaultPortrait(slug: string, avatarPath?: string) {
  if (!avatarPath) return `/companions/${slug}.png`;
  return resolveAssetUrl(avatarPath);
}

export function spriteFromEmotion(id: EmotionId): SpriteId {
  return EMOTION_SPRITE[id] ?? "smile";
}

export function spriteFromContent(content: string): SpriteId {
  const parts = parseRoleplay(content);
  let last: SpriteId = "smile";
  for (const part of parts) {
    if (part.type === "emotion") last = spriteFromEmotion(part.id);
  }
  if (/\bsit\b/i.test(content) && last === "smile") last = "sit";
  return last;
}

export function spritePath(slug: string, content: string, avatarPath?: string) {
  return spriteFile(slug, spriteFromContent(content), avatarPath);
}

export function lastAssistantSprite(
  messages: Array<{ role: string; content: string }>,
  slug: string,
  avatarPath?: string,
) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role !== "assistant" || !message.content.trim()) continue;
    return spritePath(slug, message.content, avatarPath);
  }
  return defaultPortrait(slug, avatarPath);
}
