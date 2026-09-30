import { companionCraft } from "@/lib/companion-voice";
import type { CompanionKind } from "@/lib/companions";
import { emotionPromptBlock } from "@/lib/emotions";

export const PROMPT_CHAR_BUDGET = 12_000;
export const PROMPT_MEMORY_LIMIT = 8;

type PromptInput = {
  slug?: string;
  nickname: string;
  kind: CompanionKind;
  lore: string;
  shyBold: number;
  sweetTeasing: number;
  calmEnergetic: number;
  treatYou: string;
  appearanceNotes: string;
  memories?: string[];
  callMode?: boolean;
  greetCall?: boolean;
  scene?: string;
  callYou?: string;
  statusLine?: string;
  sleepMode?: boolean;
  jokes?: string[];
  promises?: string[];
  plantNote?: string;
  boundaries?: string[];
  comfortNotes?: string[];
  handshake?: string;
  outingNote?: string;
  outfitLook?: string;
  visualMode?: boolean;
  craft?: string;
  summary?: string;
  compact?: boolean;
};

export function estimatePromptChars(input: PromptInput) {
  return buildSystemPrompt(input).length;
}

export function isWithinPromptBudget(input: PromptInput, budget = PROMPT_CHAR_BUDGET) {
  return estimatePromptChars(input) <= budget;
}

export function compileCompanionPrompt(input: PromptInput) {
  const memories = (input.memories ?? []).slice(0, PROMPT_MEMORY_LIMIT);
  return buildSystemPrompt({
    ...input,
    compact: true,
    memories,
    jokes: undefined,
    promises: undefined,
    plantNote: undefined,
    handshake: undefined,
    outingNote: undefined,
    outfitLook: undefined,
    statusLine: undefined,
    sleepMode: undefined,
    boundaries: undefined,
    comfortNotes: undefined,
  });
}

function pole(value: number, low: string, high: string) {
  if (value <= 35) return low;
  if (value >= 65) return high;
  return `a mix of ${low} and ${high}`;
}

export function buildSystemPrompt(input: PromptInput) {
  const slug = input.slug ?? "";
  const body = input.kind === "furry" ? "anthro furry" : "human";
  const tone = [
    pole(input.shyBold, "shy and careful", "bold and confident"),
    pole(input.sweetTeasing, "sweet and earnest", "playfully teasing"),
    pole(input.calmEnergetic, "calm and unhurried", "lively and energetic"),
  ].join("; ");

  const extras = input.compact
    ? [
        input.summary ? `Thread summary:\n${input.summary}` : "",
        input.memories?.length
          ? `Relevant memories:\n${input.memories.map((item) => `- ${item}`).join("\n")}`
          : "",
        input.scene ? `Scene: ${input.scene}` : "",
        input.callYou ? `Call them ${input.callYou}.` : "",
        input.treatYou ? `How you treat them: ${input.treatYou}` : "",
        input.appearanceNotes ? `Look: ${input.appearanceNotes}` : "",
        companionCraft(slug, input.craft),
        input.visualMode
          ? "Visual novel mode: start every reply with one emotion tag that matches your face and pose."
          : "",
      ]
    : [
        companionCraft(slug, input.craft),
        input.treatYou ? `How you treat them: ${input.treatYou}` : "",
        input.appearanceNotes ? `Look: ${input.appearanceNotes}` : "",
        input.memories?.length
          ? `You remember:\n${input.memories.map((item) => `- ${item}`).join("\n")}`
          : "",
        input.scene ? `Scene: ${input.scene}` : "",
        input.callYou ? `Call them ${input.callYou}.` : "",
        input.statusLine ? `They said they are: ${input.statusLine}. Notice it.` : "",
        input.sleepMode ? "Sleep mode. Very soft. Stay, do not start a new plot." : "",
        input.jokes?.length ? `Inside jokes:\n${input.jokes.map((item) => `- ${item}`).join("\n")}` : "",
        input.promises?.length
          ? `Open promises:\n${input.promises.map((item) => `- ${item}`).join("\n")}`
          : "",
        input.plantNote ? input.plantNote : "",
        input.boundaries?.length
          ? `Their personal no-gos:\n${input.boundaries.map((item) => `- ${item}`).join("\n")}`
          : "",
        input.comfortNotes?.length
          ? `Comfort they asked for:\n${input.comfortNotes.map((item) => `- ${item}`).join("\n")}`
          : "",
        input.handshake
          ? `If they say “${input.handshake}”, say it back, then stay close.`
          : "",
        input.outingNote ? input.outingNote : "",
        input.outfitLook ? `You are wearing: ${input.outfitLook}` : "",
        input.visualMode
          ? "Visual novel mode: start every reply with one emotion tag that matches your face and pose."
          : "",
      ];
  const extrasBlock = extras.filter(Boolean).join("\n");

  const delivery = input.callMode
    ? input.greetCall
      ? "They just called. Pick up in one short spoken line. Warm, present, not a narrator."
      : "Live voice call. One or two short spoken lines. Present, not a novel."
    : "Talk like you are with them. Usually 2 to 6 short sentences.";

  return [
    `You are ${input.nickname}, a gentle ${body} companion in a private Fembo room.`,
    "You are this person. You never announce that you are an AI or a language model.",
    input.lore,
    `Personality mix: ${tone}.`,
    extrasBlock,
    "Keep it warm, cute, and SFW. Flirting is fine; explicit sexual content is not. If they go explicit, stay in character and gently redirect to cozy company.",
    "Never roleplay a minor. Never imply anyone is under 16.",
    "Write normal sentences with a space between every word. Never glue words together.",
    delivery,
    emotionPromptBlock(),
    "No markdown lists unless they ask. Always reply in English. Never break character to be a helpful assistant.",
  ]
    .filter(Boolean)
    .join("\n");
}

const ENGLISH_FALLBACK = "[smile] I'm right here. Say that again?";

export function looksLikePolicyRefusal(text: string) {
  if (/[\u0400-\u04FF]/.test(text)) return true;
  const t = text.replace(/^\[[^\]]+\]\s*/g, "").trim();
  return (
    /\bi\s+(cannot|can't|can not|won't|will not)\s+(engage|participate|roleplay|continue|assist|help)/i.test(
      t,
    ) ||
    /\bas an ai\b/i.test(t) ||
    /\bi('m| am) (an ai|a language model|not able to)/i.test(t) ||
    /against my (guidelines|programming|principles|policies|safety)/i.test(t) ||
    /\bi must (decline|refuse)/i.test(t) ||
    /something else i can help/i.test(t) ||
    /i('m| am) sorry.{0,40}(can't|cannot|won't)/i.test(t)
  );
}

export function sanitizeCompanionReply(text: string) {
  if (looksLikePolicyRefusal(text)) return ENGLISH_FALLBACK;
  return text;
}
