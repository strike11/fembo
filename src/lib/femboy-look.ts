import { z } from "zod";

export const HAIR_STYLES = [
  "fluffy_short",
  "long_wavy",
  "bob",
  "twin_tails",
  "messy",
  "wolf_cut",
] as const;

export const EAR_TYPES = ["human", "cat", "fox", "bunny"] as const;
export const OUTFITS = ["hoodie", "sweater", "casual_tee", "cardigan", "school"] as const;
export const ACCESSORIES = ["none", "ribbon", "choker", "glasses"] as const;
export const BLUSH_LEVELS = ["soft", "medium", "strong"] as const;
export const FEMBOY_EXPRESSIONS = [
  "smile",
  "blushy",
  "shy",
  "wink",
  "surprised",
  "sleepy",
] as const;

export type HairStyle = (typeof HAIR_STYLES)[number];
export type EarType = (typeof EAR_TYPES)[number];
export type Outfit = (typeof OUTFITS)[number];
export type Accessory = (typeof ACCESSORIES)[number];
export type BlushLevel = (typeof BLUSH_LEVELS)[number];
export type FemboyExpression = (typeof FEMBOY_EXPRESSIONS)[number];

export type FemboyLook = {
  hairStyle: HairStyle;
  hairColor: string;
  eyeColor: string;
  skinTone: string;
  ears: EarType;
  outfit: Outfit;
  outfitColor: string;
  accessory: Accessory;
  blush: BlushLevel;
};

export const DEFAULT_FEMBOY_LOOK: FemboyLook = {
  hairStyle: "fluffy_short",
  hairColor: "#f4a4c8",
  eyeColor: "#7ec8e3",
  skinTone: "#fde8dc",
  ears: "human",
  outfit: "hoodie",
  outfitColor: "#c9d8ff",
  accessory: "ribbon",
  blush: "medium",
};

export const femboyLookSchema = z.object({
  hairStyle: z.enum(HAIR_STYLES),
  hairColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  eyeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  skinTone: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  ears: z.enum(EAR_TYPES),
  outfit: z.enum(OUTFITS),
  outfitColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accessory: z.enum(ACCESSORIES),
  blush: z.enum(BLUSH_LEVELS),
});

export const studioCreateSchema = z.object({
  name: z.string().trim().min(2).max(24),
  tagline: z.string().trim().min(4).max(80),
  lore: z.string().trim().max(500).optional(),
  look: femboyLookSchema,
  voiceId: z.string().trim().min(3).max(80).optional(),
  shyBold: z.number().int().min(0).max(100).optional(),
  sweetTeasing: z.number().int().min(0).max(100).optional(),
  calmEnergetic: z.number().int().min(0).max(100).optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/)
    .optional(),
});

export function parseLookLock(raw: string | null | undefined): FemboyLook | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = femboyLookSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function stringifyLookLock(look: FemboyLook) {
  return JSON.stringify(look);
}

export function describeLook(look: FemboyLook) {
  const hair = look.hairStyle.replaceAll("_", " ");
  const ears =
    look.ears === "human"
      ? "human ears"
      : `${look.ears} ears`;
  const outfit = look.outfit.replaceAll("_", " ");
  const accessory =
    look.accessory === "none" ? "no accessory" : look.accessory;
  return `Custom femboy look: ${hair} ${look.hairColor} hair, ${look.eyeColor} eyes, ${look.skinTone} skin, ${ears}, ${outfit} in ${look.outfitColor}, ${accessory}, ${look.blush} blush.`;
}

function blushOpacity(level: BlushLevel) {
  if (level === "soft") return 0.25;
  if (level === "strong") return 0.55;
  return 0.38;
}

function mouthPath(expression: FemboyExpression) {
  if (expression === "surprised") return `<ellipse cx="100" cy="118" rx="6" ry="8" fill="#c97888"/>`;
  if (expression === "sleepy") return `<path d="M92 118 Q100 112 108 118" stroke="#c97888" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  if (expression === "shy") return `<path d="M94 119 Q100 116 106 119" stroke="#c97888" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  if (expression === "wink") return `<path d="M93 118 Q100 123 107 118" stroke="#c97888" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
  return `<path d="M92 117 Q100 124 108 117" stroke="#c97888" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
}

function eyePair(expression: FemboyExpression, eyeColor: string) {
  const leftOpen = expression !== "sleepy";
  const rightOpen = expression !== "wink" && expression !== "sleepy";
  const highlight = `<circle cx="0" cy="0" r="2.2" fill="white" opacity="0.85"/>`;
  const eye = (cx: number, cy: number, open: boolean) => {
    if (!open) {
      return `<path d="M${cx - 7} ${cy} Q${cx} ${cy + 2} ${cx + 7} ${cy}" stroke="#3d3148" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    }
    const wide = expression === "surprised";
    const ry = wide ? 7 : 5.5;
    return `<g transform="translate(${cx} ${cy})"><ellipse cx="0" cy="0" rx="7" ry="${ry}" fill="${eyeColor}"/><circle cx="0" cy="0" r="3.2" fill="#2b2233"/>${highlight}</g>`;
  };
  return `${eye(84, 96, leftOpen)}${eye(116, 96, rightOpen)}`;
}

function earMarkup(look: FemboyLook) {
  if (look.ears === "human") return "";
  const fill = look.hairColor;
  const inner = "#ffd9ea";
  if (look.ears === "cat") {
    return `<path d="M58 72 L68 38 L82 68 Z" fill="${fill}"/><path d="M62 66 L68 46 L76 66 Z" fill="${inner}"/><path d="M118 68 L132 38 L142 72 Z" fill="${fill}"/><path d="M124 66 L132 46 L138 66 Z" fill="${inner}"/>`;
  }
  if (look.ears === "fox") {
    return `<path d="M54 78 L62 34 L84 66 Z" fill="${fill}"/><path d="M136 66 L158 34 L146 78 Z" fill="${fill}"/><path d="M58 72 L64 48 L78 68 Z" fill="#fff2f6" opacity="0.55"/>`;
  }
  return `<ellipse cx="62" cy="70" rx="12" ry="22" fill="${fill}" transform="rotate(-18 62 70)"/><ellipse cx="138" cy="70" rx="12" ry="22" fill="${fill}" transform="rotate(18 138 70)"/>`;
}

function hairBack(look: FemboyLook) {
  const c = look.hairColor;
  switch (look.hairStyle) {
    case "long_wavy":
      return `<path d="M48 88 C42 130 46 170 58 188 C68 176 72 150 70 120 C66 92 58 78 48 88 Z" fill="${c}"/><path d="M152 88 C158 130 154 170 142 188 C132 176 128 150 130 120 C134 92 142 78 152 88 Z" fill="${c}"/>`;
    case "twin_tails":
      return `<path d="M44 92 C28 120 24 156 34 182 C46 168 50 132 52 104 Z" fill="${c}"/><path d="M156 92 C172 120 176 156 166 182 C154 168 150 132 148 104 Z" fill="${c}"/>`;
    case "bob":
      return `<path d="M52 78 C48 118 50 150 62 166 C74 150 76 118 72 78 Z" fill="${c}"/><path d="M128 78 C132 118 130 150 118 166 C106 150 104 118 108 78 Z" fill="${c}"/>`;
    default:
      return `<ellipse cx="100" cy="72" rx="54" ry="46" fill="${c}"/>`;
  }
}

function hairFront(look: FemboyLook) {
  const c = look.hairColor;
  switch (look.hairStyle) {
    case "messy":
      return `<path d="M52 58 L60 34 L72 52 L80 28 L92 50 L100 24 L108 50 L120 30 L128 52 L140 38 L148 60 Z" fill="${c}"/>`;
    case "wolf_cut":
      return `<path d="M48 64 C54 34 74 24 100 24 C126 24 146 34 152 64 C146 48 128 38 100 38 C72 38 54 48 48 64 Z" fill="${c}"/><path d="M56 58 C68 42 84 36 100 36 C116 36 132 42 144 58" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round"/>`;
    case "twin_tails":
      return `<path d="M56 62 C62 34 78 26 100 26 C122 26 138 34 144 62 C132 42 116 34 100 34 C84 34 68 42 56 62 Z" fill="${c}"/>`;
    case "long_wavy":
      return `<path d="M54 64 C60 34 78 24 100 24 C122 24 140 34 146 64 C138 44 120 36 100 36 C80 36 62 44 54 64 Z" fill="${c}"/>`;
    case "bob":
      return `<path d="M54 64 C60 36 78 28 100 28 C122 28 140 36 146 64 C138 46 120 40 100 40 C80 40 62 46 54 64 Z" fill="${c}"/>`;
    default:
      return `<path d="M54 64 C60 36 78 28 100 28 C122 28 140 36 146 64 C138 48 120 42 100 42 C80 42 62 48 54 64 Z" fill="${c}"/>`;
  }
}

function outfitMarkup(look: FemboyLook) {
  const c = look.outfitColor;
  const collar = look.skinTone;
  if (look.outfit === "hoodie") {
    return `<path d="M58 142 C58 176 68 196 100 196 C132 196 142 176 142 142 L132 132 L116 140 L100 128 L84 140 L68 132 Z" fill="${c}"/><path d="M84 140 L100 152 L116 140" fill="${collar}" opacity="0.35"/>`;
  }
  if (look.outfit === "sweater") {
    return `<rect x="58" y="136" width="84" height="62" rx="18" fill="${c}"/><path d="M72 136 L84 150 L100 136 L116 150 L128 136" fill="${collar}" opacity="0.25"/>`;
  }
  if (look.outfit === "cardigan") {
    return `<path d="M58 142 C58 176 68 196 100 196 C132 196 142 176 142 142 V136 H58 Z" fill="${c}"/><line x1="100" y1="136" x2="100" y2="196" stroke="${collar}" stroke-width="2" opacity="0.35"/>`;
  }
  if (look.outfit === "school") {
    return `<path d="M58 142 C58 176 68 196 100 196 C132 196 142 176 142 142 V136 H58 Z" fill="${c}"/><path d="M84 136 L100 148 L116 136" fill="#ffffff" opacity="0.7"/><rect x="96" y="148" width="8" height="24" rx="2" fill="#d94f4f"/>`;
  }
  return `<path d="M60 142 C60 174 70 194 100 194 C130 194 140 174 140 142 L132 134 H68 Z" fill="${c}"/>`;
}

function accessoryMarkup(look: FemboyLook) {
  if (look.accessory === "ribbon") {
    return `<path d="M88 74 L100 84 L112 74 L100 92 Z" fill="#ff8fb8"/><circle cx="100" cy="84" r="4" fill="#ffd4e5"/>`;
  }
  if (look.accessory === "choker") {
    return `<rect x="84" y="128" width="32" height="6" rx="3" fill="#2f2438"/>`;
  }
  if (look.accessory === "glasses") {
    return `<rect x="72" y="90" width="22" height="14" rx="5" fill="none" stroke="#2f2438" stroke-width="2"/><rect x="106" y="90" width="22" height="14" rx="5" fill="none" stroke="#2f2438" stroke-width="2"/><line x1="94" y1="97" x2="106" y2="97" stroke="#2f2438" stroke-width="2"/>`;
  }
  return "";
}

export function femboyAvatarMarkup(
  look: FemboyLook,
  expression: FemboyExpression = "smile",
  options?: { animated?: boolean; title?: string },
) {
  const blush = blushOpacity(look.blush);
  const animated = options?.animated ?? false;
  const title = options?.title ?? "Femboy avatar preview";
  const animClass = animated ? ' class="femboy-avatar-live"' : "";
  return `<svg${animClass} viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
  <defs>
    <radialGradient id="bgGlow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fff6fb"/>
      <stop offset="100%" stop-color="#f3ecff"/>
    </radialGradient>
  </defs>
  <rect width="200" height="220" rx="24" fill="url(#bgGlow)"/>
  <ellipse cx="100" cy="206" rx="42" ry="8" fill="#000" opacity="0.08"/>
  ${earMarkup(look)}
  ${hairBack(look)}
  <ellipse cx="100" cy="150" rx="34" ry="42" fill="${look.skinTone}"/>
  ${outfitMarkup(look)}
  <ellipse cx="100" cy="96" rx="38" ry="42" fill="${look.skinTone}"/>
  <ellipse cx="82" cy="108" rx="8" ry="5" fill="#ffb6c9" opacity="${blush}"/>
  <ellipse cx="118" cy="108" rx="8" ry="5" fill="#ffb6c9" opacity="${blush}"/>
  ${eyePair(expression, look.eyeColor)}
  ${mouthPath(expression)}
  ${hairFront(look)}
  ${accessoryMarkup(look)}
</svg>`;
}

export function slugifyName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

const SPRITE_TO_EXPRESSION: Record<string, FemboyExpression> = {
  smile: "smile",
  blushy: "blushy",
  shy: "shy",
  grin: "smile",
  wink: "wink",
  love: "blushy",
  kissy: "blushy",
  sad: "shy",
  sleepy: "sleepy",
  surprised: "surprised",
  thinking: "shy",
  tease: "wink",
  wave: "smile",
  hug: "blushy",
  sit: "smile",
  smug: "wink",
};

export function spriteToExpression(content: string): FemboyExpression {
  const match = content.match(/\[(smile|blushy|shy|grin|wink|love|kissy|sad|sleepy|surprised|thinking|tease|wave|hug|sit|smug)\]/i);
  if (match?.[1]) {
    return SPRITE_TO_EXPRESSION[match[1].toLowerCase()] ?? "smile";
  }
  if (/\b(sleep|yawn|tired)\b/i.test(content)) return "sleepy";
  if (/\b(wow|gasp|surpris)\b/i.test(content)) return "surprised";
  if (/\b(blush|shy|fluster)\b/i.test(content)) return "blushy";
  if (/\b(wink|tease)\b/i.test(content)) return "wink";
  return "smile";
}
