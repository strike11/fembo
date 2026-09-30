import { prisma } from "@/lib/db";

export async function writeAudit(userId: string, action: string, detail = "") {
  await prisma.auditLog.create({
    data: { userId, action, detail: detail.slice(0, 200) },
  });
}
