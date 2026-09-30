import { ensureCompanionConfig } from "@/lib/companion-service";
import { outingWait, outingWelcome } from "@/lib/care";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, outingSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const outings = await prisma.outing.findMany({
    where: { userId: auth.session.user.id },
  });
  return Response.json({ outings });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = outingSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const ensured = await ensureCompanionConfig(auth.session.user.id, parsed.data.slug);
  if (!ensured) return Response.json({ error: "Companion not found" }, { status: 404 });
  const outing = await prisma.outing.upsert({
    where: { userId_slug: { userId: auth.session.user.id, slug: parsed.data.slug } },
    update: { away: parsed.data.away, note: parsed.data.note ?? "" },
    create: {
      userId: auth.session.user.id,
      slug: parsed.data.slug,
      away: parsed.data.away,
      note: parsed.data.note ?? "",
    },
  });
  const reply = parsed.data.away
    ? outingWait(ensured.config.nickname, parsed.data.note ?? "")
    : outingWelcome(ensured.config.nickname);
  if (!parsed.data.away) {
    await prisma.notification.create({
      data: {
        userId: auth.session.user.id,
        title: `${ensured.config.nickname} heard the latch`,
        body: reply,
        href: `/app/companions/${parsed.data.slug}`,
      },
    });
  }
  return Response.json({ outing, reply });
}
