import { PageIntro } from "@/components/page-intro";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CHANGELOG } from "@/lib/changelog";
import { getSession } from "@/lib/session";

export default async function WhatsNewPage() {
  const session = await getSession();
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader signedIn={Boolean(session)} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12">
        <PageIntro eyebrow="Notes" title="What changed in the house">
          <p>Short releases. Nothing you have to memorize.</p>
        </PageIntro>
        <div className="flex flex-col gap-3">
          {CHANGELOG.map((item) => (
            <article key={item.id} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
              <p className="text-xs text-muted-foreground">{item.id}</p>
              <p className="mt-1 font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
