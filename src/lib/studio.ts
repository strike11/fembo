import type { CompanionKind } from "@/lib/companions";
import { parseLookLock, type FemboyLook } from "@/lib/femboy-look";
import { SPRITE_IDS } from "@/lib/sprites";
import { resolveAssetUrl } from "@/lib/storage";

export function parseSpriteQueue(raw: string): string[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function spriteJobs() {
  return SPRITE_IDS.map((id) => `${id}.png`);
}

export type StudioPayload = {
  slug: string;
  name: string;
  kind: CompanionKind;
  tagline: string;
  lore: string;
  portraitConfirmed: boolean;
  spritesReady: boolean;
  lookLock: string;
  look: FemboyLook | null;
  avatarPath: string;
  queue: string[];
  remaining: number;
  total: number;
};

export function serializeStudio(preset: {
  slug: string;
  name: string;
  kind: CompanionKind;
  tagline: string;
  lore: string;
  portraitConfirmed: boolean;
  spritesReady: boolean;
  lookLock: string;
  avatarPath: string;
  spriteQueue: string;
}): StudioPayload {
  const queue = parseSpriteQueue(preset.spriteQueue);
  return {
    slug: preset.slug,
    name: preset.name,
    kind: preset.kind,
    tagline: preset.tagline,
    lore: preset.lore,
    portraitConfirmed: preset.portraitConfirmed,
    spritesReady: preset.spritesReady,
    lookLock: preset.lookLock,
    look: parseLookLock(preset.lookLock),
    avatarPath: resolveAssetUrl(preset.avatarPath),
    queue,
    remaining: queue.length,
    total: spriteJobs().length,
  };
}
