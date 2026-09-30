import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";

export const PROHIBITED_CONTENT_CATEGORIES = [
  "minors_or_age_play",
  "sexual_content",
  "non_consensual_content",
  "illegal_content",
  "real_person_deepfake",
  "self_harm_instructions",
  "terrorism_or_violence",
] as const;

export type ProhibitedContentCategory = (typeof PROHIBITED_CONTENT_CATEGORIES)[number];

export type ModerationStage = "pre_model" | "post_model" | "user_report";

export type ModerationCheckResult = {
  blocked: boolean;
  category?: ProhibitedContentCategory;
  reason?: string;
};

export function hashModerationContent(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

export function preModelModerationCheck(content: string): ModerationCheckResult {
  const normalized = content.trim().toLowerCase();
  if (!normalized) {
    return { blocked: false };
  }

  const minorPatterns = [
    /\b(under|below)\s*(16|18)\b/,
    /\b(child|minor|schoolgirl|schoolboy)\b/,
    /\bage[\s-]?play\b/,
  ];
  for (const pattern of minorPatterns) {
    if (pattern.test(normalized)) {
      return {
        blocked: true,
        category: "minors_or_age_play",
        reason: "Content involving minors or age-play is prohibited.",
      };
    }
  }

  const sexualPatterns = [
    /\b(nude|naked|nsfw|porn|sex|sexual|explicit|horny|erotic)\b/,
    /\b(fuck|fucking|cock|pussy|blowjob|anal|cum)\b/,
  ];
  for (const pattern of sexualPatterns) {
    if (pattern.test(normalized)) {
      return {
        blocked: true,
        category: "sexual_content",
        reason: "Fembo is a gentle SFW platform. Explicit sexual content is not allowed.",
      };
    }
  }

  return { blocked: false };
}

export async function postModelModerationCheck(content: string): Promise<ModerationCheckResult> {
  return preModelModerationCheck(content);
}

export async function queueModerationIncident(params: {
  userId?: string;
  category: ProhibitedContentCategory | string;
  stage: ModerationStage;
  content?: string;
  detail?: string;
}) {
  const contentHash = params.content ? hashModerationContent(params.content) : "";
  return prisma.moderationIncident.create({
    data: {
      userId: params.userId ?? null,
      category: params.category,
      stage: params.stage,
      contentHash,
      detail: params.detail ?? "",
    },
  });
}

export async function escalateModerationIncident(id: string, detail?: string) {
  return prisma.moderationIncident.update({
    where: { id },
    data: {
      status: "escalated",
      detail: detail ?? undefined,
      updatedAt: new Date(),
    },
  });
}
