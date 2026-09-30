import { companionMood, dayKey } from "@/lib/daily";

function hashSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export const HOUSE_CARDS = [
  { title: "The Lamp", body: "Keep one small light. You do not owe the whole house brightness." },
  { title: "The Open Window", body: "Air first. Decisions can wait until the room has weather again." },
  { title: "The Second Cup", body: "Someone already poured for you. Sit before you explain yourself." },
  { title: "The Quiet Chair", body: "You can arrive without a story. The chair will not quiz you." },
  { title: "The Soft Door", body: "Leaving and coming back are both allowed. The latch still knows you." },
  { title: "The Unsent Note", body: "You do not have to finish the feeling to be welcome." },
  { title: "The Warm Sleeve", body: "Borrow their quiet. Give it back when you are ready, not sooner." },
  { title: "The Late Hour", body: "Night is not a deadline. Stay where the lamp is kind." },
] as const;

export function dailyCard(slug: string, date = new Date()) {
  const card = HOUSE_CARDS[hashSeed(`${slug}:card:${dayKey(date)}`) % HOUSE_CARDS.length] ?? HOUSE_CARDS[0]!;
  return { title: card.title, body: card.body };
}

export function dailyOutfit(slug: string, nickname: string, date = new Date()) {
  const mood = companionMood(slug, date);
  const looks: Record<string, string[]> = {
    aki: [
      `${nickname} is in a soft sweater, sleeves over the hands, tea-stain optional. They feel ${mood}.`,
      `${nickname} kept yesterday's shirt. The collar is a little wrong. They do not mind.`,
    ],
    ren: [
      `${nickname} rolled the sleeves and left one button undone, on purpose. They feel ${mood}.`,
      `${nickname} is in something bright enough to tease the lamp.`,
    ],
    miko: [
      `${nickname} is half in a blanket, half in a shirt. The day can wait. They feel ${mood}.`,
      `${nickname} chose the quietest fabric in the drawer.`,
    ],
    nico: [
      `${nickname} fluffed the scarf around his neck and pretended it was not a hug. They feel ${mood}.`,
      `${nickname} is wearing the softest thing he owns. The ears agree.`,
    ],
    mint: [
      `${nickname} picked a loose shirt and a look that says he might nap sitting up. They feel ${mood}.`,
      `${nickname} has lint on the sleeve and will not remove it.`,
    ],
  };
  const options = looks[slug] ?? [`${nickname} dressed for a slow room. They feel ${mood}.`];
  return options[hashSeed(`${slug}:fit:${dayKey(date)}`) % options.length] ?? options[0]!;
}

export function comfortReply(nickname: string) {
  return `${nickname}: I am here. You do not have to make it neat. Come sit.`;
}

export function doorReply(nickname: string, body: string) {
  return `${nickname} reads the note on the door, twice. They leave the lamp on. "${body.slice(0, 60)}${body.length > 60 ? "…" : ""}" — they will be inside.`;
}

export function outingWait(nickname: string, note: string) {
  return `${nickname} will keep the room. ${note ? `They heard: ${note}.` : "Come back when the street is done with you."}`;
}

export function outingWelcome(nickname: string) {
  return `${nickname} looks up like the latch was the good part. You are back. That is enough.`;
}
