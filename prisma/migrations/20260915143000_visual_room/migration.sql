-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN "heatState" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "UserSettings" ADD COLUMN "ollamaModel" TEXT NOT NULL DEFAULT '';
