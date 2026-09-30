import { prisma } from "@/lib/db";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";
import { firstZodError, memorySchema } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const memories = await prisma.memory.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 80,
  });
  return Response.json({ memories });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const parsed = memorySchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const memory = await prisma.memory.create({
    data: { userId: session.user.id, ...parsed.data },
  });
  return Response.json({ memory });
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const body = (await request.json()) as { id?: string };
  if (!body.id) return Response.json({ error: "Missing id" }, { status: 400 });
  await prisma.memory.deleteMany({ where: { id: body.id, userId: session.user.id } });
  return Response.json({ ok: true });
}
