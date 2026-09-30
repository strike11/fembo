import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

const SHORTCUTS = [
  ["Ctrl+K", "Jump to a room"],
  ["?", "Open shortcuts overlay"],
  ["Enter", "Send a message (if enabled)"],
  ["Shift+Enter", "New line in chat"],
  ["Esc", "Close palettes"],
];

const ROOMS = [
  ["/app", "Home"],
  ["/app/explore", "Companions"],
  ["/app/companions", "Chats"],
  ["/app/calls", "Calls"],
  ["/app/memories", "Memories"],
  ["/app/boundaries", "Boundaries"],
  ["/app/archive", "Older threads"],
  ["/app/saved", "Saved"],
  ["/app/create", "Create your femboy"],
  ["/app/plus", "Plus"],
  ["/app/settings", "Settings"],
  ["/app/data", "Your data"],
  ["/app/sessions", "Sessions"],
  ["/app/feedback", "Feedback"],
  ["/support", "Support"],
];

export default function HelpPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8 pb-24 md:pb-8">
      <PageIntro eyebrow="Help" title="How to move around">
        <p>Chat, call, and the few rooms that keep a companion close.</p>
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
      <p className="text-sm leading-6 text-muted-foreground">
        Say “remember …” in chat to store a fact. Voice never reads emotion chips. Boundaries on a companion’s profile apply to every chat and call. Fembo is a gentle 16+ platform.
      </p>
    </main>
  );
}
