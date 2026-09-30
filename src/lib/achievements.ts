export const ACHIEVEMENTS = [
  { key: "first-chat", label: "First thread", hint: "You said something out loud." },
  { key: "first-call", label: "First call", hint: "They picked up." },
  { key: "first-gift", label: "First gift", hint: "You left something on the table." },
  { key: "first-letter", label: "First letter", hint: "Paper, sort of." },
  { key: "first-journal", label: "First check-in", hint: "The day got a place to sit." },
  { key: "night-owl", label: "Night owl", hint: "You used the night room." },
  { key: "ritual-3", label: "Three rituals", hint: "A small habit is forming." },
  { key: "close-bond", label: "Close", hint: "The room already knows you." },
  { key: "first-story", label: "Bedtime", hint: "They told you a sleep story." },
  { key: "first-note", label: "Private ink", hint: "You kept a note they cannot see." },
  { key: "first-capsule", label: "Time kept", hint: "You sealed a note for later." },
  { key: "green-thumb", label: "Windowsill", hint: "Something living lives here now." },
  { key: "first-date", label: "A plan", hint: "You put a night on the table." },
  { key: "first-quote", label: "Kept line", hint: "A sentence stayed on the wall." },
  { key: "lore-keeper", label: "They let you in", hint: "Three secrets, quietly." },
  { key: "first-boundary", label: "A line drawn", hint: "You told the room what not to do." },
  { key: "first-comfort", label: "Come sit", hint: "You asked to be held, in words." },
  { key: "first-card", label: "A drawn card", hint: "The house offered a small omen." },
] as const;

export function achievementByKey(key: string) {
  return ACHIEVEMENTS.find((item) => item.key === key) ?? null;
}
