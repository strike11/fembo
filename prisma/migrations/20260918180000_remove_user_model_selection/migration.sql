-- Remove the legacy user-controlled inference model while preserving every
-- remaining settings value for existing accounts.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

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
    "statusLine" TEXT NOT NULL DEFAULT '',
    "sleepMode" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT NOT NULL DEFAULT 'en',
    CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_UserSettings" (
    "ambientSound",
    "autoSpeak",
    "callAutoListen",
    "compactChat",
    "doNotDisturb",
    "enterToSend",
    "id",
    "locale",
    "nightRoom",
    "showEmotions",
    "sleepMode",
    "statusLine",
    "userId"
)
SELECT
    "ambientSound",
    "autoSpeak",
    "callAutoListen",
    "compactChat",
    "doNotDisturb",
    "enterToSend",
    "id",
    "locale",
    "nightRoom",
    "showEmotions",
    "sleepMode",
    "statusLine",
    "userId"
FROM "UserSettings";

DROP TABLE "UserSettings";
ALTER TABLE "new_UserSettings" RENAME TO "UserSettings";
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
