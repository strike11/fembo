import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session-guard";
import { catalogSchema, firstZodError, idSchema } from "@/lib/validation";

export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const kind = new URL(request.url).searchParams.get("kind") ?? "";
  const items = await prisma.catalogItem.findMany({
    where: {
      userId: auth.session.user.id,
      ...(kind ? { kind } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return Response.json({ items });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = catalogSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const item = await prisma.catalogItem.create({
    data: {
      userId: auth.session.user.id,
      slug: parsed.data.slug,
      kind: parsed.data.kind,
      title: parsed.data.title,
      note: parsed.data.note ?? "",
      body: parsed.data.body ?? "",
    },
  });
  return Response.json({ item });
}

export async function DELETE(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = idSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  await prisma.catalogItem.deleteMany({
    where: { id: parsed.data.id, userId: auth.session.user.id },
  });
  return Response.json({ ok: true });
}
