import { prisma } from "@/lib/db";

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
