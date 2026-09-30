import { COMPANION_PRESETS } from "@/lib/companions";
import { dailyLetter, dayKey } from "@/lib/daily";
import { dailyDream } from "@/lib/dreams";
import { prisma } from "@/lib/db";
import { dailyCard, dailyOutfit } from "@/lib/care";
import { capsuleReply, dailyFortune } from "@/lib/keeps";
import { loreFor } from "@/lib/lore";

export async function ensureCompanionConfig(userId: string, slug: string) {
  const preset = await prisma.companionPreset.findUnique({
    where: { slug },
  });
  if (!preset) {
    return null;
  }
  if (preset.ownerId && preset.ownerId !== userId) {
    return null;
  }
  if (preset.ownerId && !preset.spritesReady) {
    return null;
  }

  const existing = await prisma.companionConfig.findUnique({
    where: { userId_presetId: { userId, presetId: preset.id } },
    include: {
      conversations: {
        where: { archived: false },
        orderBy: { lastMessageAt: "desc" },
        take: 1,
      },
    },
  });

  if (existing) {
    const conversation = existing.conversations[0];
    if (conversation) {
      return { preset, config: existing, conversation };
    }
    const created = await prisma.conversation.create({
      data: { userId, configId: existing.id },
    });
    return { preset, config: existing, conversation: created };
  }

  const config = await prisma.companionConfig.create({
    data: {
      userId,
      presetId: preset.id,
      nickname: preset.name,
      shyBold: preset.shyBold,
      sweetTeasing: preset.sweetTeasing,
      calmEnergetic: preset.calmEnergetic,
      treatYou: "",
      appearanceNotes: preset.lookLock || "",
      callYou: "",
      voiceId: preset.defaultVoiceId,
      conversations: { create: { userId } },
    },
    include: {
      conversations: {
        orderBy: { lastMessageAt: "desc" },
        take: 1,
      },
    },
  });

  const conversation = config.conversations[0];
  if (!conversation) return null;
  return { preset, config, conversation };
}

export async function ensureUserSettings(userId: string) {
  return prisma.userSettings.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function ensureMorningLine(userId: string) {
  const hour = new Date().getHours();
  if (hour < 6 || hour > 11) return;
  const today = new Date(`${dayKey()}T00:00:00`);
  const already = await prisma.notification.findFirst({
    where: { userId, createdAt: { gte: today }, title: { startsWith: "Morning" } },
    select: { id: true },
  });
  if (already) return;
  const chat = await prisma.conversation.findFirst({
    where: { userId, archived: false, messages: { some: {} } },
    orderBy: { lastMessageAt: "desc" },
    include: { config: { include: { preset: true } } },
  });
  if (!chat) return;
  const name = chat.config.nickname;
  const slug = chat.config.preset.slug;
  await prisma.message.create({
    data: {
      conversationId: chat.id,
      role: "assistant",
      content: `[smile] Morning. I woke up thinking about you. Come sit with me a minute.`,
    },
  });
  await prisma.conversation.update({
    where: { id: chat.id },
    data: { lastMessageAt: new Date() },
  });
  await prisma.notification.create({
    data: {
      userId,
      title: `Morning from ${name}`,
      body: "They left a line in the chat.",
      href: `/app/companions/${slug}`,
    },
  });
}

export async function welcomeIfNeeded(userId: string, name: string) {
  const count = await prisma.notification.count({ where: { userId } });
  if (count > 0) return;
  await prisma.notification.create({
    data: {
      userId,
      title: `Welcome in, ${name}`,
      body: "Your room is ready. Start a chat or place a voice call.",
      href: "/app",
    },
  });
}

export async function ensureDailyLetters(userId: string) {
  const today = new Date(`${dayKey()}T00:00:00`);
  const existing = await prisma.letter.count({
    where: { userId, createdAt: { gte: today } },
  });
  if (existing > 0) return;

  const chats = await prisma.conversation.findMany({
    where: { userId, messages: { some: {} } },
    orderBy: { lastMessageAt: "desc" },
    include: { config: { include: { preset: true } } },
    take: 8,
  });
  const seen = new Set<string>();
  const targets: Array<{ slug: string; name: string }> = [];
  for (const chat of chats) {
    const slug = chat.config.preset.slug;
    if (seen.has(slug)) continue;
    seen.add(slug);
    targets.push({ slug, name: chat.config.nickname });
    if (targets.length >= 2) break;
  }
  if (targets.length === 0) {
    const first = COMPANION_PRESETS[0];
    if (first) targets.push({ slug: first.slug, name: first.name });
  }

  for (const item of targets) {
    const note = dailyLetter(item.slug, item.name);
    await prisma.letter.create({
      data: { userId, slug: item.slug, title: note.title, body: note.body },
    });
  }
}

export async function ensureDailyDreams(userId: string) {
  const today = new Date(`${dayKey()}T00:00:00`);
  const existing = await prisma.dream.count({
    where: { userId, createdAt: { gte: today } },
  });
  if (existing > 0) return;
  const first = COMPANION_PRESETS[0];
  if (!first) return;
  await prisma.dream.create({
    data: {
      userId,
      slug: first.slug,
      body: dailyDream(first.slug, first.name),
    },
  });
}

export async function unlockAchievements(userId: string) {
  const [messages, calls, gifts, letters, journal, rituals, night, stories, notes] = await Promise.all([
    prisma.message.count({ where: { conversation: { userId } } }),
    prisma.callSession.count({ where: { userId } }),
    prisma.gift.count({ where: { userId } }),
    prisma.letter.count({ where: { userId } }),
    prisma.journalEntry.count({ where: { userId } }),
    prisma.ritualDone.count({ where: { userId } }),
    prisma.userSettings.findUnique({ where: { userId }, select: { nightRoom: true } }),
    prisma.sleepStory.count({ where: { userId } }),
    prisma.privateNote.count({ where: { userId } }),
  ]);
  const keys: string[] = [];
  if (messages > 0) keys.push("first-chat");
  if (calls > 0) keys.push("first-call");
  if (gifts > 0) keys.push("first-gift");
  if (letters > 0) keys.push("first-letter");
  if (journal > 0) keys.push("first-journal");
  if (night?.nightRoom) keys.push("night-owl");
  if (rituals >= 3) keys.push("ritual-3");
  if (messages >= 20) keys.push("close-bond");
  if (stories > 0) keys.push("first-story");
  if (notes > 0) keys.push("first-note");
  const [capsules, plants, dates, quotes, lore] = await Promise.all([
    prisma.timeCapsule.count({ where: { userId } }),
    prisma.housePlant.count({ where: { userId } }),
    prisma.datePlan.count({ where: { userId } }),
    prisma.quoteClip.count({ where: { userId } }),
    prisma.loreUnlock.count({ where: { userId } }),
  ]);
  if (capsules > 0) keys.push("first-capsule");
  if (plants > 0) keys.push("green-thumb");
  if (dates > 0) keys.push("first-date");
  if (quotes > 0) keys.push("first-quote");
  if (lore >= 3) keys.push("lore-keeper");
  const [bounds, comforts, cards] = await Promise.all([
    prisma.boundary.count({ where: { userId } }),
    prisma.comfortAsk.count({ where: { userId } }),
    prisma.cardDraw.count({ where: { userId } }),
  ]);
  if (bounds > 0) keys.push("first-boundary");
  if (comforts > 0) keys.push("first-comfort");
  if (cards > 0) keys.push("first-card");
  for (const key of keys) {
    await prisma.achievement.upsert({
      where: { userId_key: { userId, key } },
      update: {},
      create: { userId, key },
    });
  }
}

export async function unlockLoreForSlug(userId: string, slug: string) {
  const messages = await prisma.message.count({
    where: { conversation: { userId, config: { preset: { slug } } } },
  });
  for (const secret of loreFor(slug)) {
    if (messages < secret.need) continue;
    await prisma.loreUnlock.upsert({
      where: { userId_slug_key: { userId, slug, key: secret.key } },
      update: {},
      create: { userId, slug, key: secret.key },
    });
  }
}

export async function ensureDailyFortunes(userId: string) {
  const today = dayKey();
  const existing = await prisma.fortune.count({ where: { userId, day: today } });
  if (existing > 0) return;
  const recent = await prisma.conversation.findFirst({
    where: { userId, messages: { some: {} } },
    orderBy: { lastMessageAt: "desc" },
    include: { config: { include: { preset: true } } },
  });
  const slug = recent?.config.preset.slug ?? COMPANION_PRESETS[0]?.slug ?? "aki";
  const nickname = recent?.config.nickname ?? "them";
  await prisma.fortune.create({
    data: { userId, slug, day: today, body: dailyFortune(slug, nickname) },
  });
}

export async function openDueCapsules(userId: string) {
  const today = dayKey();
  const due = await prisma.timeCapsule.findMany({
    where: { userId, opened: false, openOn: { lte: today } },
    take: 8,
  });
  for (const capsule of due) {
    const config = await prisma.companionConfig.findFirst({
      where: { userId, preset: { slug: capsule.slug } },
      select: { nickname: true },
    });
    const nickname = config?.nickname ?? "They";
    const reply = capsuleReply(nickname, capsule.body);
    await prisma.timeCapsule.update({
      where: { id: capsule.id },
      data: { opened: true, reply },
    });
    await prisma.notification.create({
      data: {
        userId,
        title: `${nickname} opened a capsule`,
        body: reply.slice(0, 120),
        href: "/app/capsules",
      },
    });
  }
}

export async function ensureDailyLook(userId: string) {
  const today = dayKey();
  const existing = await prisma.outfitLook.count({ where: { userId, day: today } });
  if (existing > 0) return;
  const recent = await prisma.conversation.findFirst({
    where: { userId, messages: { some: {} } },
    orderBy: { lastMessageAt: "desc" },
    include: { config: { include: { preset: true } } },
  });
  const slug = recent?.config.preset.slug ?? COMPANION_PRESETS[0]?.slug ?? "aki";
  const nickname = recent?.config.nickname ?? "them";
  await prisma.outfitLook.create({
    data: { userId, slug, day: today, look: dailyOutfit(slug, nickname) },
  });
  const card = dailyCard(slug);
  await prisma.cardDraw.upsert({
    where: { userId_slug_day: { userId, slug, day: today } },
    update: {},
    create: { userId, slug, day: today, title: card.title, body: card.body },
  });
}
