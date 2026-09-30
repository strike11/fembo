import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { clientKey, isSameOrigin, rateLimit } from "@/lib/security";
import { firstZodError, profileSchema } from "@/lib/validation";

export async function PATCH(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const limited = await rateLimit(clientKey(request, "profile"), 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many updates" }, { status: 429 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }
  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  }
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
    },
    select: { name: true },
  });
  return NextResponse.json(user);
}
