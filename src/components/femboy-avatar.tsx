"use client";

import {
  type FemboyExpression,
  type FemboyLook,
  femboyAvatarMarkup,
} from "@/lib/femboy-look";
import { cn } from "@/lib/utils";

export function FemboyAvatar({
  look,
  expression = "smile",
  animated = false,
  className,
  title,
}: {
  look: FemboyLook;
  expression?: FemboyExpression;
  animated?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <div
      className={cn(
        "femboy-avatar-shell overflow-hidden rounded-3xl bg-gradient-to-b from-[#fff6fb] to-[#f3ecff] ring-1 ring-border/60",
        animated && "femboy-avatar-shell--live",
        className,
      )}
      dangerouslySetInnerHTML={{
        __html: femboyAvatarMarkup(look, expression, { animated, title }),
      }}
    />
  );
}
