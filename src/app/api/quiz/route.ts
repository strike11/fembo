import { prisma } from "@/lib/db";
import { scoreQuiz } from "@/lib/quiz";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, quizSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  const results = await prisma.quizResult.findMany({
    where: { userId: auth.session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return Response.json({ results });
}

export async function POST(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = quizSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  const scored = scoreQuiz(parsed.data.answers);
  const result = await prisma.quizResult.create({
    data: {
      userId: auth.session.user.id,
      slug: parsed.data.slug,
      score: scored.score,
      label: scored.label,
    },
  });
  await prisma.memory.create({
    data: {
      userId: auth.session.user.id,
      slug: parsed.data.slug,
      content: `compatibility read: ${scored.label} (${scored.score})`,
    },
  });
  return Response.json({ result });
}
