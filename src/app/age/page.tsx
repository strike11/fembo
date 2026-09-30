import { PageIntro } from "@/components/page-intro";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/session";

export default async function AgePage() {
  const session = await getSession();
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader signedIn={Boolean(session)} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-12">
        <PageIntro eyebrow="Age" title="16 and older">
          <p>Signup asks for a date of birth. If you are not 16, the house will not open.</p>
        </PageIntro>
        <p className="text-sm leading-7 text-muted-foreground">
          Fembo is a cute, gentle companion platform for teens and adults. All content stays
          SFW — supportive chat, cozy scenes, and wholesome care features. No minors under 16.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
