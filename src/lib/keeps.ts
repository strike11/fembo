import { companionMood, dayKey } from "@/lib/daily";

function hashSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export const STATUS_LINES = ["Home", "Tired", "Working", "Need company", "Going to sleep"] as const;

export function shiftDay(day: string, delta: number) {
  const date = new Date(`${day}T00:00:00`);
  date.setDate(date.getDate() + delta);
  return dayKey(date);
}

export function dailyFortune(slug: string, nickname: string, date = new Date()) {
  const mood = companionMood(slug, date);
  const lines = [
    `${nickname} says the day wants you slow. They are ${mood}. Keep a cup nearby.`,
    `A small luck: someone will remember your name the way ${nickname} does. They are ${mood}.`,
    `${nickname} folded a quiet day for you. If it frays, sit down. They are ${mood}.`,
    `Do not chase the whole night. ${nickname} is ${mood}, and that is already a plan.`,
  ];
  return lines[hashSeed(`${slug}:fortune:${dayKey(date)}`) % lines.length] ?? lines[0]!;
}

export function dailyAffirmation(nickname: string, date = new Date()) {
  const lines = [
    `${nickname}: you do not have to earn the room.`,
    `${nickname}: coming back counts as courage.`,
    `${nickname}: tired still gets tea.`,
    `${nickname}: I kept you a place. That is not a joke.`,
  ];
  return lines[hashSeed(`affirm:${dayKey(date)}:${nickname}`) % lines.length] ?? lines[0]!;
}

export function capsuleReply(nickname: string, body: string) {
  const clipped = body.slice(0, 80);
  return `${nickname} opens it with both hands. They read it twice. "${clipped}${body.length > 80 ? "…" : ""}" They sit closer after.`;
}

export function plantName(slug: string, nickname: string) {
  const names: Record<string, string> = {
    aki: "Aki's tea basil",
    ren: "Ren's sunny mint",
    miko: "Miko's sleepy fern",
    nico: "Nico's window moss",
    mint: "Mint's own catnip",
  };
  return names[slug] ?? `${nickname}'s plant`;
}

export function waterPlant(current: { wateredDay: string; streak: number }, today = dayKey()) {
  if (current.wateredDay === today) {
    return { wateredDay: today, streak: current.streak, already: true };
  }
  const yesterday = shiftDay(today, -1);
  const streak = current.wateredDay === yesterday ? current.streak + 1 : 1;
  return { wateredDay: today, streak, already: false };
}

export function plantThirsty(wateredDay: string, today = dayKey()) {
  return wateredDay !== today;
}

export function fallbackSummary(nickname: string, turns: number, last: string) {
  const clip = last.slice(0, 140);
  return `${nickname} and you sat through ${turns} turns. Last they left you with: ${clip || "quiet."}`;
}

export function daysBetween(from: Date, to = new Date()) {
  const start = new Date(from.toISOString().slice(0, 10));
  const end = new Date(to.toISOString().slice(0, 10));
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}
