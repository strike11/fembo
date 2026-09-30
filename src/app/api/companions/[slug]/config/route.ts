import { NextResponse } from "next/server";
import { ensureCompanionConfig } from "@/lib/companion-service";
import { prisma } from "@/lib/db";
import { clientKey, isSameOrigin, rateLimit } from "@/lib/security";
import { getSession } from "@/lib/session";
import { companionConfigSchema, firstZodError } from "@/lib/validation";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const limited = await rateLimit(clientKey(request, "config"), 30, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many updates" }, { status: 429 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }
  const { slug } = await params;
  const ensured = await ensureCompanionConfig(session.user.id, slug);
  if (!ensured) {
    return NextResponse.json({ error: "Companion not found" }, { status: 404 });
  }
  const parsed = companionConfigSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  }
  const config = await prisma.companionConfig.update({
    where: { id: ensured.config.id },
    data: parsed.data,
  });
  return NextResponse.json({
    nickname: config.nickname,
    shyBold: config.shyBold,
    sweetTeasing: config.sweetTeasing,
    calmEnergetic: config.calmEnergetic,
    treatYou: config.treatYou,
    appearanceNotes: config.appearanceNotes,
    callYou: config.callYou,
    voiceId: config.voiceId,
  });
}
