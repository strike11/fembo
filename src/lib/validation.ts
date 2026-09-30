import { SCENE_IDS } from "@/lib/scenes";
import { z } from "zod";

export const COMMON_PASSWORDS = new Set([
  "password1234",
  "password12345",
  "123456789012",
  "qwertyuiopas",
  "letmein12345",
  "welcome12345",
  "iloveyou1234",
  "adminadmin12",
  "changeme1234",
  "passw0rd1234",
]);

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters").max(40),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z
    .string()
    .min(12, "Use at least 12 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Include a letter")
    .regex(/[0-9]/, "Include a number"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter your date of birth"),
  ageConfirmed: z.literal(true, { error: "You must confirm you are 16 or older" }),
  termsAccepted: z.literal(true, { error: "Accept the terms to join" }),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password").max(128),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(40),
});

export const companionConfigSchema = z.object({
  nickname: z.string().trim().min(1, "Give them a name").max(40),
  shyBold: z.number().int().min(0).max(100),
  sweetTeasing: z.number().int().min(0).max(100),
  calmEnergetic: z.number().int().min(0).max(100),
  treatYou: z.string().trim().max(500),
  appearanceNotes: z.string().trim().max(400),
  callYou: z.string().trim().max(40).optional(),
  voiceId: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-zA-Z0-9_.:-]+$/, "Use a Piper voice id"),
});

export const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(40)
  .regex(/^[a-z0-9-]+$/);

export const idempotencyKeySchema = z.string().trim().min(8).max(80);

export const chatSchema = z.object({
  slug: slugSchema,
  content: z.string().trim().min(1, "Say something").max(4000),
  conversationId: z.string().trim().min(1).max(40).optional(),
  scene: z.enum(SCENE_IDS).optional(),
  visual: z.boolean().optional(),
  idempotencyKey: idempotencyKeySchema.optional(),
});

export const regenerateSchema = z.object({
  slug: slugSchema,
  conversationId: z.string().trim().min(1).max(40).optional(),
  visual: z.boolean().optional(),
  idempotencyKey: idempotencyKeySchema.optional(),
});

export const journalSchema = z.object({
  mood: z.string().trim().min(2).max(40),
  content: z.string().trim().min(2).max(500),
  slug: slugSchema.optional().or(z.literal("")),
});

export const letterRequestSchema = z.object({
  slug: slugSchema,
});

export const giftSchema = z.object({
  slug: slugSchema,
  kind: z.enum(["tea", "flower", "plush", "song", "cocoa", "star"]),
});

export const reactionSchema = z.object({
  reaction: z.string().trim().max(16),
});

export const settingsSchema = z.object({
  enterToSend: z.boolean(),
  autoSpeak: z.boolean(),
  showEmotions: z.boolean(),
  callAutoListen: z.boolean(),
  nightRoom: z.boolean(),
  compactChat: z.boolean(),
  doNotDisturb: z.boolean(),
  ambientSound: z.boolean(),
  statusLine: z.string().trim().max(80).optional(),
  sleepMode: z.boolean().optional(),
  name: z.string().trim().min(2).max(40),
  locale: z.enum(["en", "ru"]).optional(),
});

export const presenceSchema = z.object({
  statusLine: z.string().trim().max(80).optional(),
  sleepMode: z.boolean().optional(),
});

export const capsuleSchema = z.object({
  slug: slugSchema,
  body: z.string().trim().min(2).max(400),
  openOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
});

export const promiseSchema = z.object({
  slug: slugSchema,
  content: z.string().trim().min(2).max(200),
  keeper: z.enum(["you", "them"]),
});

export const jokeSchema = z.object({
  slug: slugSchema,
  content: z.string().trim().min(2).max(200),
});

export const wishSchema = z.object({
  slug: slugSchema,
  content: z.string().trim().min(2).max(200),
});

export const datePlanSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(2).max(60),
  whenLabel: z.string().trim().min(2).max(40),
  notes: z.string().trim().max(200).optional(),
});

export const quoteSchema = z.object({
  slug: slugSchema,
  body: z.string().trim().min(2).max(280),
});

export const songSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(2).max(80),
  note: z.string().trim().max(120).optional(),
});

export const gardenSchema = z.object({
  slug: slugSchema,
  action: z.enum(["plant", "water"]),
});

export const summarySchema = z.object({
  slug: slugSchema,
  conversationId: z.string().trim().min(1).max(40),
});

export const quizSchema = z.object({
  slug: slugSchema,
  answers: z.array(z.number().int().min(0).max(3)).min(5).max(5),
});

export const idSchema = z.object({
  id: z.string().trim().min(1).max(40),
});

export const lineSchema = z.object({
  content: z.string().trim().min(2).max(200),
});

export const handshakeSchema = z.object({
  phrase: z.string().trim().min(2).max(40),
});

export const doorSchema = z.object({
  slug: slugSchema,
  body: z.string().trim().min(2).max(280),
});

export const outingSchema = z.object({
  slug: slugSchema,
  away: z.boolean(),
  note: z.string().trim().max(80).optional(),
});

export const catalogSchema = z.object({
  slug: slugSchema,
  kind: z.enum(["recipe", "book", "watch"]),
  title: z.string().trim().min(2).max(80),
  note: z.string().trim().max(160).optional(),
  body: z.string().trim().max(400).optional(),
});

export const taskSchema = z.object({
  slug: slugSchema,
  content: z.string().trim().min(2).max(200),
});

export const feedbackSchema = z.object({
  kind: z.enum(["bug", "idea", "safety", "crash"]),
  body: z.string().trim().min(4).max(800),
  href: z.string().trim().max(120).optional(),
});

export const clientErrorSchema = z.object({
  message: z.string().trim().min(2).max(300),
  digest: z.string().trim().max(80).optional(),
  href: z.string().trim().max(160).optional(),
});

export const abuseSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(120)
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, "Enter a valid email"),
  body: z.string().trim().min(8).max(800),
  href: z.string().trim().max(160).optional(),
});

export const reportSchema = z.object({
  slug: slugSchema,
  snippet: z.string().trim().min(2).max(280),
  reason: z.string().trim().min(2).max(200),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: z
    .string()
    .min(12, "Use at least 12 characters")
    .max(128)
    .regex(/[A-Za-z]/, "Include a letter")
    .regex(/[0-9]/, "Include a number"),
});

export const deleteAccountSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  confirm: z.literal("DELETE"),
});

export const ritualSchema = z.object({
  key: z.enum(["morning", "tea", "checkin", "walk", "date", "goodnight"]),
  slug: slugSchema,
});

export const bookmarkSchema = z.object({
  slug: slugSchema,
  snippet: z.string().trim().min(1).max(280),
});

export const reminderSchema = z.object({
  slug: slugSchema,
  content: z.string().trim().min(2).max(200),
  dueLabel: z.string().trim().min(2).max(40),
});

export const momentSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(2).max(60),
  body: z.string().trim().min(2).max(400),
});

export const voicemailSchema = z.object({
  slug: slugSchema,
  body: z.string().trim().min(2).max(400),
});

export const dreamRequestSchema = z.object({
  slug: slugSchema,
});

export const noteSchema = z.object({
  slug: slugSchema,
  content: z.string().trim().min(2).max(400),
});

export const macroSchema = z.object({
  title: z.string().trim().min(2).max(40),
  content: z.string().trim().min(2).max(400),
});

export const storyRequestSchema = z.object({
  slug: slugSchema,
});

export const pingSchema = z.object({
  slug: slugSchema,
});

export const memorySchema = z.object({
  slug: slugSchema,
  content: z.string().trim().min(3).max(240),
});

export const callTurnSchema = z.object({
  slug: slugSchema,
  callId: z.string().trim().min(1).max(40),
  content: z.string().trim().max(2000).optional(),
  greet: z.boolean().optional(),
  idempotencyKey: idempotencyKeySchema.optional(),
});

export const MIN_AGE = 16;

export function isAtLeast16(dateOfBirth: Date, now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE);
  return dateOfBirth <= cutoff;
}

export function firstZodError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Check the form and try again";
}
