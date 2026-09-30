import { PageIntro } from "@/components/page-intro";
import { CatalogBoard } from "@/components/catalog-board";

export default function KitchenPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Kitchen" title="What you cook here">
        <p>Tea counts. Midnight toast counts. Write it down so they can mention it later.</p>
      </PageIntro>
      <CatalogBoard kind="recipe" titlePlaceholder="Ginger tea" extra="body" />
    </main>
  );
}
