"use client";

import Image from "next/image";
import { FemboyAvatar } from "@/components/femboy-avatar";
import {
  type FemboyExpression,
  type FemboyLook,
  parseLookLock,
  spriteToExpression,
} from "@/lib/femboy-look";
import { resolveAssetUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function CompanionPortrait({
  slug,
  avatarPath,
  lookLock,
  expression,
  animated = false,
  className,
  imageClassName,
  fill = false,
  width,
  height,
  priority,
  alt = "",
}: {
  slug: string;
  avatarPath?: string;
  lookLock?: string | null;
  expression?: FemboyExpression;
  animated?: boolean;
  className?: string;
  imageClassName?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  alt?: string;
}) {
  const look: FemboyLook | null = lookLock ? parseLookLock(lookLock) : null;

  if (look) {
    return (
      <FemboyAvatar
        look={look}
        expression={expression ?? "smile"}
        animated={animated}
        className={cn("relative h-full w-full", className)}
        title={alt || `${slug} portrait`}
      />
    );
  }

  const src = resolveAssetUrl(avatarPath || `/companions/${slug}.png`);
  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 400}
      height={height ?? 500}
      fill={fill}
      priority={priority}
      className={cn("object-cover object-top", imageClassName, className)}
    />
  );
}

export function expressionFromMessage(content: string): FemboyExpression {
  return spriteToExpression(content);
}
