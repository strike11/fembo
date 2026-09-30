import { ensureUserSettings } from "@/lib/companion-service";

import { prisma } from "@/lib/db";

import { isSameOrigin } from "@/lib/security";

import { getSession } from "@/lib/session";

import { firstZodError, settingsSchema } from "@/lib/validation";



export async function GET() {

  const session = await getSession();

  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });

  const settings = await ensureUserSettings(session.user.id);

  const user = await prisma.user.findUnique({

    where: { id: session.user.id },

    select: { name: true },

  });

  return Response.json({ settings, user });

}



export async function PATCH(request: Request) {

  if (!isSameOrigin(request)) return Response.json({ error: "Invalid origin" }, { status: 403 });

  const session = await getSession();

  if (!session) return Response.json({ error: "Sign in first" }, { status: 401 });

  const parsed = settingsSchema.safeParse(await request.json());

  if (!parsed.success) return Response.json({ error: firstZodError(parsed.error) }, { status: 400 });



  await ensureUserSettings(session.user.id);

  await prisma.userSettings.update({

    where: { userId: session.user.id },

    data: {

      enterToSend: parsed.data.enterToSend,

      autoSpeak: parsed.data.autoSpeak,

      showEmotions: parsed.data.showEmotions,

      callAutoListen: parsed.data.callAutoListen,

      nightRoom: parsed.data.nightRoom,

      compactChat: parsed.data.compactChat,

      doNotDisturb: parsed.data.doNotDisturb,

      ambientSound: parsed.data.ambientSound,

      ...(parsed.data.statusLine !== undefined ? { statusLine: parsed.data.statusLine } : {}),

      ...(parsed.data.sleepMode !== undefined ? { sleepMode: parsed.data.sleepMode } : {}),

      ...(parsed.data.locale !== undefined ? { locale: parsed.data.locale } : {}),

    },

  });

  await prisma.user.update({

    where: { id: session.user.id },

    data: { name: parsed.data.name },

  });

  return Response.json({ ok: true });

}

