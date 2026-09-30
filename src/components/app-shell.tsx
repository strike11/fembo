"use client";

import { MenuIcon, XIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AppSidebar, type SidebarRecent } from "@/components/app-sidebar";
import { CommandPalette } from "@/components/command-palette";
import { IdleGuard } from "@/components/idle-guard";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { OfflineBanner } from "@/components/offline-banner";
import { ShortcutsHelp } from "@/components/shortcuts-help";
import { Button } from "@/components/ui/button";
import { asLocale, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function AppShell({
  name,
  recents,
  locale = "en",
  houseExtras = false,
  children,
}: {
  name: string;
  recents: SidebarRecent[];
  locale?: string;
  houseExtras?: boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const lang = asLocale(locale);
  const [open, setOpen] = useState(false);
  const isCall = pathname.startsWith("/app/call/");
  const isVisual = /\/app\/companions\/[^/]+\/visual\/?$/.test(pathname);

  if (isCall || isVisual) {
    return <div className="flex h-dvh flex-col overflow-hidden">{children}</div>;
  }

  return (
    <div className="flex h-dvh overflow-hidden">
      <div className="hidden md:flex">
        <AppSidebar name={name} recents={recents} locale={locale} houseExtras={houseExtras} />
      </div>
      {open ? (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-foreground/20 motion-reduce:transition-none"
            aria-label={t(lang, "closeMenu")}
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 h-full">
            <AppSidebar name={name} recents={recents} locale={locale} houseExtras={houseExtras} />
          </div>
        </div>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner />
        <div className="flex h-12 items-center gap-2 border-b border-border/70 px-3 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label={open ? t(lang, "closeMenu") : t(lang, "openMenu")}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <XIcon /> : <MenuIcon />}
          </Button>
          <span className="text-sm font-medium">Fembo</span>
        </div>
        <div className={cn("flex min-h-0 flex-1 flex-col pb-14 md:pb-0")}>{children}</div>
        <MobileBottomNav locale={locale} houseExtras={houseExtras} />
      </div>
      <CommandPalette />
      <ShortcutsHelp />
      <IdleGuard />
    </div>
  );
}
