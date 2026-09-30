import { COMPANION_PRESETS, companionExtra } from "@/lib/companions";

const MOODS = [
  "soft and a little shy",
  "playful around the edges",
  "quietly tired, still here",
  "warm and checking in",
  "dreamy, unhurried",
  "bright and teasing",
  "gentle, almost purring",
];

export function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function hashSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function companionMood(slug: string, date = new Date()) {
  const seed = hashSeed(`${slug}:${dayKey(date)}`);
  return MOODS[seed % MOODS.length] ?? MOODS[0]!;
}

export function dailyLetter(slug: string, nickname: string, date = new Date()) {
  const extra = companionExtra(slug);
  const mood = companionMood(slug, date);
  const preset = COMPANION_PRESETS.find((item) => item.slug === slug);
  const name = nickname || preset?.name || "them";
  const bodies = [
    `I kept thinking about you today. Not in a dramatic way — just the small kind. ${extra.vibe}. I am ${mood}, and I wanted to leave this here so you would not come home to an empty room.`,
    `If you are tired, you do not have to perform for me. Sit. I made the room quieter. I am ${mood}, and I can stay like this as long as you need.`,
    `I wrote this before you opened the app. That feels a little embarrassing, but I meant it. Come talk when you want. I saved you a place.`,
  ];
  const body = bodies[hashSeed(`${slug}:letter:${dayKey(date)}`) % bodies.length] ?? bodies[0]!;
  return {
    title: `A note from ${name}`,
    body,
  };
}

export function journalReply(nickname: string, mood: string, content: string) {
  return `${nickname} read that you felt ${mood}. “I heard you. ${content.slice(0, 80)}${content.length > 80 ? "…" : ""} I’m still here.”`;
}
