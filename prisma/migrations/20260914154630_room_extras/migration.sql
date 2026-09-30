-- CreateTable
CREATE TABLE "PrivateNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrivateNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PromptMacro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PromptMacro_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SleepStory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SleepStory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MissYouPing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "reply" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MissYouPing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CompanionConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "presetId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "shyBold" INTEGER NOT NULL,
    "sweetTeasing" INTEGER NOT NULL,
    "calmEnergetic" INTEGER NOT NULL,
    "treatYou" TEXT NOT NULL,
    "appearanceNotes" TEXT NOT NULL,
    "callYou" TEXT NOT NULL DEFAULT '',
    "voiceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CompanionConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CompanionConfig_presetId_fkey" FOREIGN KEY ("presetId") REFERENCES "CompanionPreset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CompanionConfig" ("appearanceNotes", "calmEnergetic", "createdAt", "id", "nickname", "presetId", "shyBold", "sweetTeasing", "treatYou", "updatedAt", "userId", "voiceId") SELECT "appearanceNotes", "calmEnergetic", "createdAt", "id", "nickname", "presetId", "shyBold", "sweetTeasing", "treatYou", "updatedAt", "userId", "voiceId" FROM "CompanionConfig";
DROP TABLE "CompanionConfig";
ALTER TABLE "new_CompanionConfig" RENAME TO "CompanionConfig";
CREATE UNIQUE INDEX "CompanionConfig_userId_presetId_key" ON "CompanionConfig"("userId", "presetId");
CREATE TABLE "new_UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "enterToSend" BOOLEAN NOT NULL DEFAULT true,
    "autoSpeak" BOOLEAN NOT NULL DEFAULT true,
    "showEmotions" BOOLEAN NOT NULL DEFAULT true,
    "callAutoListen" BOOLEAN NOT NULL DEFAULT true,
    "nightRoom" BOOLEAN NOT NULL DEFAULT false,
    "compactChat" BOOLEAN NOT NULL DEFAULT false,
    "doNotDisturb" BOOLEAN NOT NULL DEFAULT false,
    "ambientSound" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserSettings" ("autoSpeak", "callAutoListen", "compactChat", "doNotDisturb", "enterToSend", "id", "nightRoom", "showEmotions", "userId") SELECT "autoSpeak", "callAutoListen", "compactChat", "doNotDisturb", "enterToSend", "id", "nightRoom", "showEmotions", "userId" FROM "UserSettings";
DROP TABLE "UserSettings";
ALTER TABLE "new_UserSettings" RENAME TO "UserSettings";
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PrivateNote_userId_slug_idx" ON "PrivateNote"("userId", "slug");

-- CreateIndex
CREATE INDEX "PromptMacro_userId_idx" ON "PromptMacro"("userId");

-- CreateIndex
CREATE INDEX "SleepStory_userId_createdAt_idx" ON "SleepStory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MissYouPing_userId_createdAt_idx" ON "MissYouPing"("userId", "createdAt");
