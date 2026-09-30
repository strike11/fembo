import { companionMood, dayKey } from "@/lib/daily";

function hashSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function sleepStory(slug: string, nickname: string, date = new Date()) {
  const mood = companionMood(slug, date);
  const bodies = [
    `${nickname} keeps the lamp very low. The room is ${mood}. They tell you about a window that never quite closes, and rain that never quite arrives, until your breathing matches theirs.`,
    `A short walk that never leaves the pillow. ${nickname} counts the quiet things: a cup, a sleeve, your name. Then they stop counting and stay.`,
    `They invent a street with no clocks. You walk it together. Nobody asks what time it is. ${nickname} is ${mood}, and that is enough for the story to end.`,
  ];
  return {
    title: `A story from ${nickname}`,
    body: bodies[hashSeed(`${slug}:story:${dayKey(date)}`) % bodies.length] ?? bodies[0]!,
  };
}

export function missYouReply(nickname: string) {
  return `${nickname}: I felt that. I am still here. Come when you can.`;
}
