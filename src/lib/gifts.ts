export type GiftKind = "tea" | "flower" | "plush" | "song" | "cocoa" | "star";

export type GiftDef = {
  id: GiftKind;
  label: string;
  emoji: string;
  memory: string;
  thanks: string;
};

export const GIFTS: GiftDef[] = [
  {
    id: "tea",
    label: "Tea",
    emoji: "🍵",
    memory: "likes when you bring them tea",
    thanks: "They wrap both hands around the cup and stay a little closer.",
  },
  {
    id: "flower",
    label: "Flower",
    emoji: "🌸",
    memory: "you once gave them a flower",
    thanks: "They tuck it where they can keep looking at it.",
  },
  {
    id: "plush",
    label: "Plush",
    emoji: "🧸",
    memory: "keeps the plush you gave them",
    thanks: "They hug it once, then glance at you like the gift was the point.",
  },
  {
    id: "song",
    label: "Song",
    emoji: "🎵",
    memory: "you shared a quiet song with them",
    thanks: "They listen all the way through and bump your shoulder after.",
  },
  {
    id: "cocoa",
    label: "Cocoa",
    emoji: "🍫",
    memory: "remembers the cocoa nights",
    thanks: "Sweet, warm, and a little messy on the rim. They do not mind.",
  },
  {
    id: "star",
    label: "Star",
    emoji: "⭐",
    memory: "you named a star for them, half joking",
    thanks: "They pretend it is silly. They do not forget it.",
  },
];

export function giftById(id: string) {
  return GIFTS.find((gift) => gift.id === id) ?? null;
}
