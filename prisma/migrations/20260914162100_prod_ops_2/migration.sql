-- AlterTable
ALTER TABLE "user" ADD COLUMN "lastLoginAt" DATETIME;
ALTER TABLE "user" ADD COLUMN "termsAcceptedAt" DATETIME;

-- CreateTable
CREATE TABLE "AbuseReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL,
    "href" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
