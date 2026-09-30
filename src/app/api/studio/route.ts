import { prisma } from "@/lib/db";
import {
  buildCraftFromLook,
  companionKindFromLook,
  lookLockFromLook,
  writeFemboyAvatar,
} from "@/lib/femboy-studio";
import { slugifyName, studioCreateSchema } from "@/lib/femboy-look";
import { SOFT_VOICES } from "@/lib/companions";
import { isSameOrigin } from "@/lib/security";
import { getSession } from "@/lib/session";
import { firstZodError } from "@/lib/validation";
import { serializeStudio } from "@/lib/studio";

async function loadOwned(userId: string, slug: string) {
  return prisma.companionPreset.findFirst({
    where: { slug, ownerId: userId },
  });
}

async function uniqueSlug(userId: string, base: string) {
  let slug = base || "custom";
  let attempt = 0;
  while (attempt < 20) {
    const existing = await prisma.companionPreset.findUnique({ where: { slug } });
    if (!existing || existing.ownerId === userId) return slug;
    attempt += 1;
    slug = `${base}-${attempt}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Sign in first" }), { status: 401 });
  }
  const slug = new URL(request.url).searchParams.get("slug");
  if (slug) {
    const preset = await loadOwned(session.user.id, slug);
    if (!preset) {
      return new Response(JSON.stringify({ error: "Draft not found" }), { status: 404 });
    }
    return Response.json(serializeStudio(preset));
  }

  const presets = await prisma.companionPreset.findMany({
    where: { ownerId: session.user.id },
    orderBy: { name: "asc" },
  });
  return Response.json({
    drafts: presets.map(serializeStudio),
  });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return new Response(JSON.stringify({ error: "Invalid origin" }), { status: 403 });
  }
  const session = await getSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Sign in first" }), { status: 401 });
  }

  const parsed = studioCreateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: firstZodError(parsed.error) }), { status: 400 });
  }

  const data = parsed.data;
  const baseSlug = data.slug ?? slugifyName(data.name);
  if (!baseSlug) {
    return new Response(JSON.stringify({ error: "Pick a valid name" }), { status: 400 });
  }

  const slug = data.slug ? baseSlug : await uniqueSlug(session.user.id, baseSlug);
  const existing = await loadOwned(session.user.id, slug);
  if (data.slug && !existing) {
    return new Response(JSON.stringify({ error: "Draft not found" }), { status: 404 });
  }

  const avatarPath = await writeFemboyAvatar(slug, data.look);
  const lookLock = lookLockFromLook(data.look);
  const kind = companionKindFromLook(data.look);
  const craft = buildCraftFromLook(data.look);
  const lore =
    data.lore?.trim() ||
    `${data.name} is a gentle 16+ femboy companion who loves soft company, cute outfits, and being supportive. ${craft}`;

  const preset = existing
    ? await prisma.companionPreset.update({
        where: { id: existing.id },
        data: {
          name: data.name,
          tagline: data.tagline,
          lore,
          kind,
          lookLock,
          craft,
          avatarPath,
          defaultVoiceId: data.voiceId ?? existing.defaultVoiceId,
          shyBold: data.shyBold ?? existing.shyBold,
          sweetTeasing: data.sweetTeasing ?? existing.sweetTeasing,
          calmEnergetic: data.calmEnergetic ?? existing.calmEnergetic,
          portraitConfirmed: true,
          spritesReady: true,
          spriteQueue: "",
        },
      })
    : await prisma.companionPreset.create({
        data: {
          slug,
          name: data.name,
          tagline: data.tagline,
          lore,
          kind,
          lookLock,
          craft,
          avatarPath,
          ownerId: session.user.id,
          defaultVoiceId: data.voiceId ?? SOFT_VOICES[0].id,
          shyBold: data.shyBold ?? 40,
          sweetTeasing: data.sweetTeasing ?? 45,
          calmEnergetic: data.calmEnergetic ?? 35,
          portraitConfirmed: true,
          spritesReady: true,
        },
      });

  return Response.json({ slug: preset.slug, preset: serializeStudio(preset) });
}
