import { ensureCompanionConfig } from "@/lib/companion-service";
import { dayKey } from "@/lib/daily";
import { prisma } from "@/lib/db";
import { plantName, waterPlant } from "@/lib/keeps";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, gardenSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const plants = await prisma.housePlant.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "asc" },
  });
  return Response.json({ plants, today: dayKey() });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = gardenSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const ensured = await ensureCompanionConfig(auth.session.user.id, parsed.data.slug);
  if (!ensured) return Response.json({ error: "Companion not found" }, { status: 404 });
  const today = dayKey();
  const existing = await prisma.housePlant.findUnique({
    where: { userId_slug: { userId: auth.session.user.id, slug: parsed.data.slug } },
  });
  if (parsed.data.action === "plant") {
    const plant =
      existing ??
      (await prisma.housePlant.create({
        data: {
          userId: auth.session.user.id,
          slug: parsed.data.slug,
          name: plantName(parsed.data.slug, ensured.config.nickname),
          wateredDay: today,
          streak: 1,
        },
      }));
    return Response.json({ plant });
  }
  if (!existing) {
    return Response.json({ error: "Plant one first" }, { status: 400 });
  }
  const next = waterPlant(existing, today);
  const plant = await prisma.housePlant.update({
    where: { id: existing.id },
    data: { wateredDay: next.wateredDay, streak: next.streak },
  });
  return Response.json({ plant, already: next.already });
}
