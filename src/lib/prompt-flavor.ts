import { prisma } from "@/lib/db";
import { dayKey } from "@/lib/daily";
import { plantThirsty } from "@/lib/keeps";

export async function loadPromptFlavor(userId: string, slug: string) {
  const today = dayKey();
  const [settings, jokes, promises, plant, boundaries, aftercare, handshake, outing, outfit] =
    await Promise.all([
      prisma.userSettings.findUnique({
        where: { userId },
        select: { statusLine: true, sleepMode: true },
      }),
      prisma.insideJoke.findMany({
        where: { userId, slug },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { content: true },
      }),
      prisma.promiseItem.findMany({
        where: { userId, slug, done: false },
        take: 3,
        select: { content: true, keeper: true },
      }),
      prisma.housePlant.findUnique({
        where: { userId_slug: { userId, slug } },
      }),
      prisma.boundary.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { content: true },
      }),
      prisma.aftercareNote.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: { content: true },
      }),
      prisma.handshake.findUnique({ where: { userId } }),
      prisma.outing.findUnique({ where: { userId_slug: { userId, slug } } }),
      prisma.outfitLook.findUnique({
        where: { userId_slug_day: { userId, slug, day: today } },
      }),
    ]);

  return {
    statusLine: settings?.statusLine ?? "",
    sleepMode: settings?.sleepMode ?? false,
    jokes: jokes.map((item) => item.content),
    promises: promises.map((item) =>
      item.keeper === "them" ? `you promised: ${item.content}` : `they are holding you to: ${item.content}`,
    ),
    plantNote:
      plant && plantThirsty(plant.wateredDay, today)
        ? `${plant.name} is thirsty.`
        : plant
          ? `${plant.name} is fine today.`
          : "",
    boundaries: boundaries.map((item) => item.content),
    comfortNotes: aftercare.map((item) => item.content),
    handshake: handshake?.phrase ?? "",
    outingNote: outing?.away
      ? `The user is out${outing.note ? ` (${outing.note})` : ""}. They may text from elsewhere. Keep it light and keep the room.`
      : "",
    outfitLook: outfit?.look ?? "",
  };
}
