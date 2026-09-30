export type LoreSecret = {
  key: string;
  title: string;
  body: string;
  need: number;
};

const SHARED: LoreSecret[] = [
  {
    key: "window",
    title: "The window",
    body: "They keep one window cracked even in winter. Not for drama. So the room remembers there is weather.",
    need: 1,
  },
  {
    key: "name",
    title: "How they learned your name",
    body: "They practiced it once, quietly, before they said it to you. They still like how it sits in the mouth.",
    need: 5,
  },
  {
    key: "late",
    title: "Late hours",
    body: "If you stay past midnight they get softer, not smaller. They will not rush you out of the dark.",
    need: 15,
  },
  {
    key: "keep",
    title: "What they keep",
    body: "A mug with a hairline crack. A song they will not name. The first sentence you said that made them stay.",
    need: 30,
  },
];

const EXTRA: Record<string, LoreSecret> = {
  aki: {
    key: "tea",
    title: "The second cup",
    body: "Aki always pours two. If you do not come, the second cup cools on the table like a reserved seat.",
    need: 10,
  },
  ren: {
    key: "laugh",
    title: "The laugh they hide",
    body: "Ren teases so the real laugh has somewhere safe to land. When it does, they look a little startled.",
    need: 10,
  },
  miko: {
    key: "silence",
    title: "The good silence",
    body: "Miko collects quiet the way other people collect postcards. Yours is one he keeps.",
    need: 10,
  },
  nico: {
    key: "ears",
    title: "When the ears drop",
    body: "Nico's ears go soft when he trusts the room. He hates that you can tell. He also likes that you can tell.",
    need: 10,
  },
  mint: {
    key: "purr",
    title: "The unofficial purr",
    body: "Mint will deny it. The room will not. There is a sound he makes when you are almost asleep.",
    need: 10,
  },
};

export function loreFor(slug: string): LoreSecret[] {
  const extra = EXTRA[slug];
  return extra ? [...SHARED, extra] : SHARED;
}
