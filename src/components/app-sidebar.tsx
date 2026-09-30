"use client";

import {
  CompassIcon,
  CrownIcon,
  HomeIcon,
  MessageCircleIcon,
  PlusIcon,
  SettingsIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { NotificationMenu } from "@/components/notification-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { formatRelative } from "@/lib/format";
import { asLocale, t } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type SidebarRecent = {
  id: string;
  slug: string;
  name: string;
  avatarPath: string;
  preview: string;
  pinned: boolean;
  updatedAt: string;
};

const NAV = [
  { href: "/app", labelKey: "navHome" as const, icon: HomeIcon },
  { href: "/app/explore", labelKey: "navExplore" as const, icon: CompassIcon },
  { href: "/app/companions", labelKey: "navChats" as const, icon: MessageCircleIcon },
  { href: "/app/create", labelKey: "create" as const, icon: PlusIcon },
  { href: "/app/plus", labelKey: "plus" as const, icon: CrownIcon },
  { href: "/app/settings", labelKey: "navSettings" as const, icon: SettingsIcon },
] as const;

export function AppSidebar({
  name,
  recents,
  locale = "en",
}: {
  name: string;
  recents: SidebarRecent[];
  locale?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const lang = asLocale(locale);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    Array<{ id: string; content: string; slug: string; name: string }>
  >([]);

  async function search(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    const response = await fetch(`/api/search?q=${encodeURIComponent(value.trim())}`);
    if (!response.ok) return;
    const payload = (await response.json()) as {
      results?: Array<{ id: string; content: string; slug: string; name: string }>;
    };
    setResults(payload.results ?? []);
  }

  return (
    <aside className="flex h-full w-[272px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/app" aria-label="Fembo home" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
          <Logo className="h-7" />
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationMenu />
        </div>
      </div>
      <div className="px-3 pb-3">
        <Input
          value={query}
          onChange={(event) => void search(event.target.value)}
          placeholder={t(lang, "searchChats")}
          aria-label={t(lang, "searchChats")}
          className="h-9 bg-background"
        />
        {results.length > 0 ? (
          <div className="mt-2 overflow-hidden rounded-xl bg-background ring-1 ring-border">
            {results.slice(0, 5).map((result) => (
              <Link
                key={result.id}
                href={`/app/companions/${result.slug}`}
                className="block px-3 py-2 text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                <p className="font-medium">{result.name}</p>
                <p className="truncate text-xs text-muted-foreground">{result.content}</p>
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      <nav className="flex flex-col gap-0.5 px-2" aria-label="Main">
        {NAV.map((item) => {
          const active =
            item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/70",
              )}
            >
              <item.icon className="size-4" aria-hidden />
              {t(lang, item.labelKey)}
            </Link>
          );
        })}
      </nav>
      <div className="mt-3 flex flex-col gap-0.5 px-2">
        <Link
          href="/app/saved"
          className={cn(
            "rounded-xl px-3 py-1.5 text-sm transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            pathname.startsWith("/app/saved")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/70",
          )}
        >
          {t(lang, "navSaved")}
        </Link>
        <Link
          href="/app/memories"
          className={cn(
            "rounded-xl px-3 py-1.5 text-sm transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            pathname.startsWith("/app/memories")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/70",
          )}
        >
          {t(lang, "memories")}
        </Link>
        <Link
          href="/app/boundaries"
          className={cn(
            "rounded-xl px-3 py-1.5 text-sm transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            pathname.startsWith("/app/boundaries")
              ? "bg-sidebar-accent text-sidebar-accent-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent/70",
          )}
        >
          {t(lang, "boundaries")}
        </Link>
      </div>
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-2">
        <p className="px-3 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t(lang, "recents")}
        </p>
        <div className="flex flex-col gap-0.5">
          {recents.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">{t(lang, "noChatsYet")}</p>
          ) : (
            recents.map((recent) => (
              <Link
                key={recent.id}
                href={`/app/companions/${recent.slug}`}
                className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-2 hover:bg-sidebar-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Image
                  src={recent.avatarPath}
                  alt=""
                  width={32}
                  height={32}
                  className="size-8 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">
                    {recent.pinned ? "★ " : ""}
                    {recent.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{recent.preview}</p>
                </div>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {formatRelative(recent.updatedAt)}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-sidebar-border px-3 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{name}</p>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <Link href="/app/settings" className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
              {t(lang, "account")}
            </Link>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            void authClient.signOut({
              fetchOptions: { onSuccess: () => router.push("/") },
            });
          }}
        >
          {t(lang, "signOut")}
        </Button>
      </div>
    </aside>
  );
}
