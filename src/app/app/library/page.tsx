import { PageIntro } from "@/components/page-intro";
import { CatalogBoard } from "@/components/catalog-board";

export default function LibraryPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Library" title="Books on your side">
        <p>Titles they would leave face-down so you can pick them up.</p>
      </PageIntro>
      <CatalogBoard kind="book" titlePlaceholder="A quiet novel" extra="note" />
    </main>
  );
}
