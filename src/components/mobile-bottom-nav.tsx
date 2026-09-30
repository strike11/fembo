"use client";

import {
  CompassIcon,
  EllipsisIcon,
  HomeIcon,
  MessageCircleIcon,
  PhoneIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { asLocale, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type MobileBottomNavProps = {
  locale?: string;
  houseExtras?: boolean;
};

const PRIMARY = [
  { href: "/app", labelKey: "navHome" as const, icon: HomeIcon, match: (path: string) => path === "/app" },
  {
    href: "/app/companions",
    labelKey: "navChats" as const,
    icon: MessageCircleIcon,
    match: (path: string) => path.startsWith("/app/companions") && !path.includes("/visual"),
  },
  {
    href: "/app/explore",
    labelKey: "navExplore" as const,
    icon: CompassIcon,
    match: (path: string) => path.startsWith("/app/explore"),
  },
  {
    href: "/app/calls",
    labelKey: "navCalls" as const,
    icon: PhoneIcon,
    match: (path: string) => path.startsWith("/app/call"),
  },
] as const;

export function MobileBottomNav({ locale = "en", houseExtras = false }: MobileBottomNavProps) {
  const pathname = usePathname();
  const lang = asLocale(locale);
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [moreOpen]);

  const moreActive =
    pathname.startsWith("/app/saved") ||
    pathname.startsWith("/app/house") ||
    pathname.startsWith("/app/settings") ||
    pathname.startsWith("/app/plus") ||
    pathname.startsWith("/app/create");

  const moreLinks = [
    { href: "/app/saved", label: t(lang, "navSaved") },
    { href: "/app/create", label: t(lang, "create") },
    { href: "/app/plus", label: t(lang, "plus") },
    { href: "/app/settings", label: t(lang, "navSettings") },
    ...(houseExtras ? [{ href: "/app/house", label: t(lang, "navHouse") }] : []),
    { href: "/app/help", label: "Help" },
  ];

  return (
    <>
      {moreOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/20 motion-reduce:transition-none"
            aria-label={t(lang, "closeMenu")}
            onClick={() => setMoreOpen(false)}
          />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={t(lang, "mobileMore")}
            className="absolute inset-x-0 bottom-0 z-50 rounded-t-2xl bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] ring-1 ring-border motion-reduce:transition-none"
          >
            <div className="mb-3 h-1 w-10 self-center rounded-full bg-muted" />
            <nav className="flex flex-col gap-1">
              {moreLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setMoreOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      ) : null}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {PRIMARY.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-5" aria-hidden />
              {t(lang, item.labelKey)}
            </Link>
          );
        })}
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
          className={cn(
            "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset motion-reduce:transition-none",
            moreActive || moreOpen ? "text-primary" : "text-muted-foreground",
          )}
          onClick={() => setMoreOpen((value) => !value)}
        >
          <EllipsisIcon className="size-5" aria-hidden />
          {t(lang, "mobileMore")}
        </button>
      </nav>
    </>
  );
}
