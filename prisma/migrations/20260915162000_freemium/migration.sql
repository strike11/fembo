-- AlterTable
ALTER TABLE "user" ADD COLUMN "plusUntil" DATETIME;
ALTER TABLE "user" ADD COLUMN "stripeCustomerId" TEXT;
ALTER TABLE "user" ADD COLUMN "stripeSubscriptionId" TEXT;

-- AlterTable
ALTER TABLE "CompanionPreset" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "CompanionPreset" ADD COLUMN "nsfwArt" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CompanionPreset" ADD COLUMN "portraitConfirmed" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "CompanionPreset" ADD COLUMN "spritesReady" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "CompanionPreset" ADD COLUMN "lookLock" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CompanionPreset" ADD COLUMN "craft" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CompanionPreset" ADD COLUMN "heatLine" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CompanionPreset" ADD COLUMN "spriteQueue" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "CompanionPreset_ownerId_idx" ON "CompanionPreset"("ownerId");
