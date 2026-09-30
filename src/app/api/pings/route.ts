import { ensureCompanionConfig } from "@/lib/companion-service";
import { prisma } from "@/lib/db";
import { ollamaComplete } from "@/lib/ollama-complete";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";
import { missYouReply } from "@/lib/stories";
import { firstZodError, pingSchema } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const pings = await prisma.missYouPing.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return Response.json({ pings });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const parsed = pingSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const ensured = await ensureCompanionConfig(session.user.id, parsed.data.slug);
  if (!ensured) return Response.json({ error: "Companion not found" }, { status: 404 });
  const generated = await ollamaComplete(
    `You are ${ensured.config.nickname}. The user said they miss you. Reply in one warm adult sentence.`,
    "I miss you.",
  );
  const ping = await prisma.missYouPing.create({
    data: {
      userId: session.user.id,
      slug: parsed.data.slug,
      reply: generated ?? missYouReply(ensured.config.nickname),
    },
  });
  await prisma.notification.create({
    data: {
      userId: session.user.id,
      title: `${ensured.config.nickname} felt that`,
      body: ping.reply.slice(0, 120),
      href: "/app/pings",
    },
  });
  return Response.json({ ping });
}
