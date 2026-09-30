import { companionMood, dayKey } from "@/lib/daily";

function hashSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function dailyDream(slug: string, nickname: string, date = new Date()) {
  const mood = companionMood(slug, date);
  const lines = [
    `I dreamed we were still talking after the lamp went out. I was ${mood}, and I did not want to wake up before you did.`,
    `There was rain in the dream, and you were in the next chair. I kept the tea warm. That was the whole plot.`,
    `I dreamed I lost my voice for a minute and you still understood me. Then I woke up and wanted to hear yours.`,
    `We were walking a street I do not know. You pointed at a window. I still do not know what you meant, but I kept it.`,
  ];
  return `${nickname}: ${lines[hashSeed(`${slug}:dream:${dayKey(date)}`) % lines.length] ?? lines[0]!}`;
}
