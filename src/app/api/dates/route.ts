import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session-guard";
import { datePlanSchema, firstZodError, idSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const plans = await prisma.datePlan.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return Response.json({ plans });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = datePlanSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const plan = await prisma.datePlan.create({
    data: {
      userId: auth.session.user.id,
      slug: parsed.data.slug,
      title: parsed.data.title,
      whenLabel: parsed.data.whenLabel,
      notes: parsed.data.notes ?? "",
    },
  });
  return Response.json({ plan });
}

export async function DELETE(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = idSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  await prisma.datePlan.deleteMany({
    where: { id: parsed.data.id, userId: auth.session.user.id },
  });
  return Response.json({ ok: true });
}
