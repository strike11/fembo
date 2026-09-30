import { dayKey } from "@/lib/daily";
import { prisma } from "@/lib/db";
import { ritualByKey } from "@/lib/rituals";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";
import { firstZodError, ritualSchema } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const done = await prisma.ritualDone.findMany({
    where: { userId: session.user.id, day: dayKey() },
  });
  return Response.json({ done: done.map((item) => item.key) });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const parsed = ritualSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const ritual = ritualByKey(parsed.data.key);
  if (!ritual) return Response.json({ error: "Unknown ritual" }, { status: 400 });

  const day = dayKey();
  await prisma.ritualDone.upsert({
    where: {
      userId_key_day: { userId: session.user.id, key: ritual.key, day },
    },
    update: {},
    create: { userId: session.user.id, key: ritual.key, slug: parsed.data.slug, day },
  });
  return Response.json({ ritual, line: ritual.line, scene: ritual.scene ?? "default" });
}
