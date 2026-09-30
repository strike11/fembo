"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { COMPANION_PRESETS } from "@/lib/companions";

const LINKS = [
  { href: "/app", label: "Home" },
  { href: "/app/explore", label: "Explore" },
  { href: "/app/create", label: "Create your femboy" },
  { href: "/app/plus", label: "Plus" },
  { href: "/app/companions", label: "Chats" },
  { href: "/app/calls", label: "Calls" },
  { href: "/app/journal", label: "Journal" },
  { href: "/app/letters", label: "Letters" },
  { href: "/app/activity", label: "Activity" },
  { href: "/app/archive", label: "Archive" },
  { href: "/app/memories", label: "Memories" },
  { href: "/app/rituals", label: "Rituals" },
  { href: "/app/dreams", label: "Dreams" },
  { href: "/app/bookmarks", label: "Bookmarks" },
  { href: "/app/reminders", label: "Reminders" },
  { href: "/app/moments", label: "Moments" },
  { href: "/app/voicemail", label: "Voicemail" },
  { href: "/app/recap", label: "Weekly recap" },
  { href: "/app/achievements", label: "Achievements" },
  { href: "/app/notes", label: "Private notes" },
  { href: "/app/macros", label: "Macros" },
  { href: "/app/stories", label: "Sleep stories" },
  { href: "/app/pings", label: "Miss you" },
  { href: "/app/shelf", label: "Gift shelf" },
  { href: "/app/status", label: "Now board" },
  { href: "/app/insights", label: "Insights" },
  { href: "/app/help", label: "Help" },
  { href: "/app/keeps", label: "Keeps" },
  { href: "/app/capsules", label: "Time capsules" },
  { href: "/app/promises", label: "Promises" },
  { href: "/app/jokes", label: "Inside jokes" },
  { href: "/app/bucket", label: "Bucket list" },
  { href: "/app/quotes", label: "Quote wall" },
  { href: "/app/playlist", label: "Playlist" },
  { href: "/app/dates", label: "Dates" },
  { href: "/app/fortune", label: "Fortune" },
  { href: "/app/lore", label: "Secrets" },
  { href: "/app/garden", label: "Garden" },
  { href: "/app/calendar", label: "Calendar" },
  { href: "/app/quiz", label: "Fit quiz" },
  { href: "/app/summaries", label: "Summaries" },
  { href: "/app/care", label: "Care" },
  { href: "/app/boundaries", label: "Boundaries" },
  { href: "/app/comfort", label: "Comfort" },
  { href: "/app/door", label: "Door notes" },
  { href: "/app/out", label: "Out / back" },
  { href: "/app/wardrobe", label: "Wardrobe" },
  { href: "/app/cards", label: "House cards" },
  { href: "/app/handshake", label: "Handshake" },
  { href: "/app/kitchen", label: "Kitchen" },
  { href: "/app/library", label: "Library" },
  { href: "/app/watch", label: "Watch list" },
  { href: "/app/tasks", label: "Care tasks" },
  { href: "/app/system", label: "System" },
  { href: "/app/sessions", label: "Sessions" },
  { href: "/app/feedback", label: "Feedback" },
  { href: "/app/data", label: "Your data" },
  { href: "/support", label: "Support" },
  { href: "/whats-new", label: "What’s new" },
  { href: "/privacy", label: "Privacy" },
  { href: "/app/settings", label: "Settings" },
  ...COMPANION_PRESETS.flatMap((companion) => [
    { href: `/app/companions/${companion.slug}`, label: `Chat ${companion.name}` },
    { href: `/app/companions/${companion.slug}/visual`, label: `Visual ${companion.name}` },
    { href: `/app/call/${companion.slug}`, label: `Call ${companion.name}` },
    { href: `/app/companions/${companion.slug}/profile`, label: `${companion.name} profile` },
  ]),
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return LINKS.slice(0, 10);
    return LINKS.filter((item) => item.label.toLowerCase().includes(needle)).slice(0, 12);
  }, [query]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/20 px-4 pt-24">
      <button type="button" className="absolute inset-0" aria-label="Close command palette" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl bg-popover shadow-xl ring-1 ring-foreground/10">
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Go somewhere… Ctrl+K"
          className="h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none"
        />
        <div className="max-h-80 overflow-y-auto p-1">
          {matches.map((item) => (
            <button
              key={item.href}
              type="button"
              className="flex w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => {
                setOpen(false);
                setQuery("");
                router.push(item.href);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
