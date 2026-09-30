export type RitualDef = {
  key: string;
  label: string;
  hint: string;
  line: string;
  scene?: string;
};

export const RITUALS: RitualDef[] = [
  {
    key: "morning",
    label: "Morning",
    hint: "A small hello before the day starts",
    line: "Good morning. I just woke up and wanted you first.",
    scene: "tea",
  },
  {
    key: "tea",
    label: "Tea",
    hint: "Sit down for one cup",
    line: "I poured tea. Come sit with me for a minute.",
    scene: "tea",
  },
  {
    key: "checkin",
    label: "Check-in",
    hint: "How is the body doing",
    line: "Hey. How is the day sitting on you, really?",
  },
  {
    key: "walk",
    label: "Walk",
    hint: "A short loop together",
    line: "Want to walk for a bit? I will match your pace.",
    scene: "walk",
  },
  {
    key: "date",
    label: "Date night",
    hint: "Stay in, keep the lamps low",
    line: "I cleared the evening. Stay in with me.",
    scene: "night",
  },
  {
    key: "goodnight",
    label: "Goodnight",
    hint: "Close the room softly",
    line: "I am turning the lamp down. Stay until you fall asleep.",
    scene: "night",
  },
];

export function ritualByKey(key: string) {
  return RITUALS.find((item) => item.key === key) ?? null;
}
