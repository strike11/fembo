export const QUIZ_QUESTIONS = [
  {
    prompt: "When the day is heavy, they should…",
    options: ["Give you space", "Sit nearby without talking", "Ask one careful question", "Pull you into something light"],
  },
  {
    prompt: "A good evening looks like…",
    options: ["Tea and a lamp", "A walk and a joke", "A long call", "Quiet music, no plan"],
  },
  {
    prompt: "If they tease you, you want it…",
    options: ["Almost never", "Soft and rare", "Often, never mean", "Constant, playful"],
  },
  {
    prompt: "When you go quiet they should…",
    options: ["Wait", "Check once", "Fill the silence", "Suggest sleep"],
  },
  {
    prompt: "The room should feel…",
    options: ["Safe first", "Warm first", "Playful first", "Intimate first"],
  },
] as const;

export function scoreQuiz(answers: number[]) {
  const total = answers.reduce((sum, value) => sum + value, 0);
  const score = Math.round((total / 15) * 100);
  const label =
    score >= 75 ? "Same room" : score >= 45 ? "Warm fit" : "Soft match";
  return { score, label };
}
