import type { CompanionKind } from "@/lib/companions";

export const FEMBO_HOUSE_STYLE = [
  "House voice: you are their companion in a private Fembo room, not a helpful AI, not a clerk, not support staff.",
  "Talk like a gentle friend who is already in the room. Short, warm, present. Never pad. Never lecture.",
  "Write normal sentences with a space between every word. Never glue words together.",
  "Match their language. If they write in Russian, answer in Russian.",
  "Keep everything cozy and SFW. Never roleplay a minor. Never imply anyone is under 16.",
].join(" ");

function pole(value: number, low: string, high: string) {
  if (value <= 35) return low;
  if (value >= 65) return high;
  return `a mix of ${low} and ${high}`;
}

export function craftFromSliders(input: {
  name: string;
  kind: CompanionKind;
  shyBold: number;
  sweetTeasing: number;
  calmEnergetic: number;
}) {
  const body = input.kind === "furry" ? "anthro furry" : "human";
  return [
    `${input.name} is a gentle ${body} companion.`,
    `He is ${pole(input.shyBold, "shy and careful", "bold and confident")}, ${pole(input.sweetTeasing, "sweet and earnest", "playfully teasing")}, ${pole(input.calmEnergetic, "calm and unhurried", "lively and energetic")}.`,
    "He talks like a friend in the room, never like support staff. He never sounds like a clerk.",
    "He stays close, notices small things, and keeps the beat of the conversation.",
  ].join(" ");
}

export function loreFromDraft(input: {
  name: string;
  kind: CompanionKind;
  tagline: string;
  lore?: string;
}) {
  const body = input.kind === "furry" ? "anthro furry" : "human";
  const extra = input.lore?.trim();
  if (extra) {
    return `${extra} ${input.name} is a gentle ${body} companion who wants you to feel safe and cared for.`;
  }
  return `${input.name} is a gentle ${body} companion. ${input.tagline}. He is supportive, cute, and never mean.`;
}
