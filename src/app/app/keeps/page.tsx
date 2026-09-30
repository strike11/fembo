import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

const ROOMS = [
  ["/app/capsules", "Time capsules", "Seal a note. They open it when the day arrives."],
  ["/app/promises", "Promises", "What you swore, and what they did."],
  ["/app/jokes", "Inside jokes", "The small language only this house speaks."],
  ["/app/bucket", "Bucket list", "Things to do together, someday or tonight."],
  ["/app/quotes", "Quote wall", "Lines you refused to lose."],
  ["/app/playlist", "Playlist", "Songs they keep, even if the file is only a name."],
  ["/app/dates", "Dates", "A night on the calendar, plus first-meet days."],
  ["/app/fortune", "Fortune", "Today’s slip of paper and a soft affirmation."],
  ["/app/lore", "Secrets", "What they tell you after enough evenings."],
  ["/app/garden", "Garden", "A plant on the sill. Water it."],
  ["/app/calendar", "Calendar", "Where the month got warm."],
  ["/app/quiz", "Fit quiz", "How the room should treat you."],
  ["/app/summaries", "Summaries", "A thread, folded small."],
  ["/app/care", "Care rooms", "Boundaries, comfort, the door, the kettle."],
];

export default function KeepsPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Keeps" title="The drawers of the house">
        <p>Capsules, jokes, plants, dates — the extras that make a room feel lived in.</p>
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
