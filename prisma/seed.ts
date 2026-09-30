import { PrismaClient } from "@prisma/client";
import { COMPANION_PRESETS } from "../src/lib/companions";

const prisma = new PrismaClient();

async function main() {
  for (const preset of COMPANION_PRESETS) {
    await prisma.companionPreset.upsert({
      where: { slug: preset.slug },
      update: {
        name: preset.name,
        kind: preset.kind,
        tagline: preset.tagline,
        lore: preset.lore,
        shyBold: preset.shyBold,
        sweetTeasing: preset.sweetTeasing,
        calmEnergetic: preset.calmEnergetic,
        defaultVoiceId: preset.defaultVoiceId,
        avatarPath: preset.avatarPath,
      },
      create: preset,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
