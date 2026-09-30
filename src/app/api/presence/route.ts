import { ensureUserSettings } from "@/lib/companion-service";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session-guard";
import { firstZodError, presenceSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  const auth = await requireSession(request);
  if (!auth.session) return auth.response;
  const parsed = presenceSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });
  await ensureUserSettings(auth.session.user.id);
  const settings = await prisma.userSettings.update({
    where: { userId: auth.session.user.id },
    data: {
      ...(parsed.data.statusLine !== undefined ? { statusLine: parsed.data.statusLine } : {}),
      ...(parsed.data.sleepMode !== undefined ? { sleepMode: parsed.data.sleepMode } : {}),
    },
  });
  return Response.json({ settings });
}
