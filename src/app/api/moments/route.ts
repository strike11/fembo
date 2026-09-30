import { prisma } from "@/lib/db";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";
import { firstZodError, momentSchema } from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const moments = await prisma.moment.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });
  return Response.json({ moments });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getSession();
  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });
  const parsed = momentSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const moment = await prisma.moment.create({
    data: { userId: session.user.id, ...parsed.data },
  });
  return Response.json({ moment });
}
