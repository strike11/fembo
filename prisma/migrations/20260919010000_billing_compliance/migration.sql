-- CreateEnum
CREATE TYPE "ModerationIncidentStatus" AS ENUM ('open', 'reviewing', 'resolved', 'escalated');

-- CreateEnum
CREATE TYPE "ModerationStage" AS ENUM ('pre_model', 'post_model', 'user_report');

-- CreateTable
CREATE TABLE "PaymentWebhookEvent" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModerationIncident" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "category" TEXT NOT NULL,
    "stage" "ModerationStage" NOT NULL,
    "status" "ModerationIncidentStatus" NOT NULL DEFAULT 'open',
    "contentHash" TEXT NOT NULL DEFAULT '',
    "detail" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "ModerationIncident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentWebhookEvent_providerId_eventId_key" ON "PaymentWebhookEvent"("providerId", "eventId");

-- CreateIndex
CREATE INDEX "PaymentWebhookEvent_processedAt_idx" ON "PaymentWebhookEvent"("processedAt");

-- CreateIndex
CREATE INDEX "ModerationIncident_status_createdAt_idx" ON "ModerationIncident"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ModerationIncident_userId_createdAt_idx" ON "ModerationIncident"("userId", "createdAt");
