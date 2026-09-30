export type BondLevel = {
  score: number;
  label: string;
  hint: string;
};

export function bondFromCounts(input: {
  messages: number;
  calls: number;
  memories: number;
  gifts: number;
}) {
  const score = Math.min(
    100,
    input.messages * 2 + input.calls * 8 + input.memories * 6 + input.gifts * 10,
  );
  if (score >= 80) return { score, label: "Devoted", hint: "They look for you first." };
  if (score >= 50) return { score, label: "Close", hint: "The room already knows you." };
  if (score >= 20) return { score, label: "Familiar", hint: "A habit is forming." };
  return { score, label: "New", hint: "Still learning your voice." };
}

export function streakFromDates(dates: Date[]) {
  const days = new Set(dates.map((date) => date.toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  for (let index = 0; index < 30; index += 1) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
