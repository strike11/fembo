"use client";

import { ImageIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { asLocale, t, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function RoomModes({
  slug,
  active,
  locale = "en",
}: {
  slug: string;
  active: "chat" | "visual" | "call";
  locale?: Locale | string;
}) {
  const lang = asLocale(locale);
  const items = [
    { id: "chat" as const, href: `/app/companions/${slug}`, label: t(lang, "chat"), icon: MessageCircleIcon },
    { id: "visual" as const, href: `/app/companions/${slug}/visual`, label: t(lang, "visual"), icon: ImageIcon },
    { id: "call" as const, href: `/app/call/${slug}`, label: t(lang, "call"), icon: PhoneIcon },
  ];

  return (
    <div className="flex items-center gap-1 rounded-full bg-muted/80 p-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        const on = item.id === active;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              buttonVariants({ variant: on ? "default" : "ghost", size: "sm" }),
              "h-8 gap-1 rounded-full px-2.5",
            )}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
