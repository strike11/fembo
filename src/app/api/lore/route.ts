import { unlockLoreForSlug } from "@/lib/companion-service";
import { COMPANION_PRESETS } from "@/lib/companions";
import { prisma } from "@/lib/db";
import { loreFor } from "@/lib/lore";
import { requireSession } from "@/lib/session-guard";

export async function GET() {
  const auth = await requireSession();
  if (!auth.session) return auth.response;
  for (const companion of COMPANION_PRESETS) {
    await unlockLoreForSlug(auth.session.user.id, companion.slug);
  }
  const unlocked = await prisma.loreUnlock.findMany({
    where: { userId: auth.session.user.id },
  });
  const have = new Set(unlocked.map((item) => `${item.slug}:${item.key}`));
  const catalog = COMPANION_PRESETS.map((companion) => ({
    slug: companion.slug,
    name: companion.name,
    secrets: loreFor(companion.slug).map((secret) => ({
      key: secret.key,
      title: secret.title,
      body: have.has(`${companion.slug}:${secret.key}`) ? secret.body : "",
      need: secret.need,
      open: have.has(`${companion.slug}:${secret.key}`),
    })),
  }));
  return Response.json({ catalog });
}
