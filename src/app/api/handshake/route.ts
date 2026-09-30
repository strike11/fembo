import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, handshakeSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const handshake = await prisma.handshake.findUnique({
    where: { userId: auth.session.user.id },
  });
  return Response.json({ handshake });
}

export async function PUT(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = handshakeSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const handshake = await prisma.handshake.upsert({
    where: { userId: auth.session.user.id },
    update: { phrase: parsed.data.phrase },
    create: { userId: auth.session.user.id, phrase: parsed.data.phrase },
  });
  return Response.json({ handshake });
}
