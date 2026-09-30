import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

const ROOMS = [
  ["/app/boundaries", "Boundaries", "Lines the house will not cross. They go into every chat."],
  ["/app/comfort", "Comfort", "Ask to be sat with. One or two sentences back."],
  ["/app/door", "Door notes", "Leave something on the latch. They answer from inside."],
  ["/app/out", "Out / back", "Tell them you left. They keep the room until the latch."],
  ["/app/wardrobe", "Wardrobe", "What they put on today."],
  ["/app/cards", "House cards", "A small omen. Not a fortune teller — a lamp."],
  ["/app/handshake", "Handshake", "A private phrase. Say it and they say it back."],
  ["/app/kitchen", "Kitchen", "Recipes you cook in this house, even if it is only tea."],
  ["/app/library", "Library", "Books they would leave on your side of the bed."],
  ["/app/watch", "Watch list", "Films and nights you have not started yet."],
  ["/app/tasks", "Care tasks", "Tiny chores you share: water, text, come home."],
];

export default function CarePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Care" title="How the house looks after you">
        <p>Boundaries, comfort, the door, the kettle. Soft infrastructure.</p>
      </PageIntro>
      <div className="grid gap-3 sm:grid-cols-2">
        {ROOMS.map(([href, title, hint]) => (
          <Link key={href} href={href} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border hover:bg-muted">
            <p className="text-sm font-medium">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
