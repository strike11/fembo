import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

const SHORTCUTS = [
  ["Ctrl+K", "Jump to any room"],
  ["?", "Open shortcuts overlay"],
  ["Enter", "Send a message (if enabled)"],
  ["Shift+Enter", "New line in chat"],
  ["Esc", "Close palettes"],
];

const ROOMS = [
  ["/app/status", "Now board"],
  ["/app/insights", "Bond insights"],
  ["/app/notes", "Private notes"],
  ["/app/macros", "Saved lines"],
  ["/app/stories", "Sleep stories"],
  ["/app/pings", "Miss-you pings"],
  ["/app/shelf", "Gift shelf"],
  ["/app/keeps", "Keeps drawer"],
  ["/app/capsules", "Time capsules"],
  ["/app/garden", "Garden"],
  ["/app/fortune", "Daily fortune"],
  ["/app/lore", "Secrets"],
  ["/app/dates", "Dates"],
  ["/app/calendar", "Calendar"],
  ["/app/care", "Care rooms"],
  ["/app/boundaries", "Boundaries"],
  ["/app/comfort", "Comfort"],
  ["/app/system", "System status"],
  ["/app/sessions", "Sessions"],
  ["/app/feedback", "Feedback"],
  ["/app/data", "Your data"],
  ["/support", "Support"],
  ["/app/rituals", "Daily rituals"],
  ["/app/settings", "Room settings"],
  ["/app/plus", "Plus"],
  ["/app/create", "Create your femboy"],
];

export default function HelpPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Help" title="How to move around">
        <p>Keys, rooms, and a few habits the house already understands.</p>
      </PageIntro>
      <section className="rounded-2xl bg-card p-4 ring-1 ring-border">
        <p className="text-sm font-medium">Shortcuts</p>
        <div className="mt-3 flex flex-col gap-2">
          {SHORTCUTS.map(([key, label]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <kbd className="rounded-md bg-muted px-2 py-0.5 text-xs">{key}</kbd>
            </div>
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <p className="text-sm font-medium">Rooms</p>
        {ROOMS.map(([href, label]) => (
          <Link key={href} href={href} className="rounded-xl px-3 py-2 text-sm hover:bg-muted">
            {label}
          </Link>
        ))}
      </section>
      <p className="text-sm text-muted-foreground">
        Say “remember …” in chat to store a fact. Voice never reads emotion chips. Fembo is a gentle 16+ platform.
      </p>
    </main>
  );
}
