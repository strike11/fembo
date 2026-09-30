import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { CompanionKind } from "@/lib/companions";
import {
  describeLook,
  femboyAvatarMarkup,
  stringifyLookLock,
  type FemboyLook,
} from "@/lib/femboy-look";

export async function writeFemboyAvatar(slug: string, look: FemboyLook) {
  const dir = join(process.cwd(), "public", "custom", slug);
  await mkdir(dir, { recursive: true });
  const svg = femboyAvatarMarkup(look, "smile", { title: `${slug} avatar` });
  const avatarPath = join(dir, "avatar.svg");
  await writeFile(avatarPath, svg, "utf8");
  return `/custom/${slug}/avatar.svg`;
}

export function companionKindFromLook(look: FemboyLook): CompanionKind {
  return look.ears === "human" ? "human" : "furry";
}

export function buildCraftFromLook(look: FemboyLook) {
  return describeLook(look);
}

export function lookLockFromLook(look: FemboyLook) {
  return stringifyLookLock(look);
}
