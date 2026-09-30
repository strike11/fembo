import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, idSchema, jokeSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const jokes = await prisma.insideJoke.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return Response.json({ jokes });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = jokeSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const joke = await prisma.insideJoke.create({
    data: { userId: auth.session.user.id, ...parsed.data },
  });
  return Response.json({ joke });
}

export async function DELETE(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = idSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  await prisma.insideJoke.deleteMany({
    where: { id: parsed.data.id, userId: auth.session.user.id },
  });
  return Response.json({ ok: true });
}
