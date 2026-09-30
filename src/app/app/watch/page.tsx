import { PageIntro } from "@/components/page-intro";
import { CatalogBoard } from "@/components/catalog-board";

export default function WatchPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Watch" title="Nights you have not started">
        <p>A list, not a schedule. Tap it into a date when you want.</p>
      </PageIntro>
      <CatalogBoard kind="watch" titlePlaceholder="Something slow" extra="note" />
    </main>
  );
}
