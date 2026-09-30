import { prisma } from "@/lib/db";

export async function loadPromptFlavor(userId: string, _slug: string) {
  const [settings, boundaries, aftercare] = await Promise.all([
    prisma.userSettings.findUnique({
      where: { userId },
      select: { statusLine: true, sleepMode: true },
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
  ]);

  return {
    statusLine: settings?.statusLine ?? "",
    sleepMode: settings?.sleepMode ?? false,
    boundaries: boundaries.map((item) => item.content),
    comfortNotes: aftercare.map((item) => item.content),
  };
}
