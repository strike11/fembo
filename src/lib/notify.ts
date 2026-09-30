import { prisma } from "@/lib/db";

export async function notify(userId: string, title: string, body: string, href: string) {
  await prisma.notification.create({
    data: { userId, title, body, href },
  });
}
