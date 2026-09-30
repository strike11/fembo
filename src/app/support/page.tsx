import { PageIntro } from "@/components/page-intro";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SupportForm } from "@/components/support-form";
import { getSession } from "@/lib/session";

export default async function SupportPage() {
  const session = await getSession();
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader signedIn={Boolean(session)} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12">
        <PageIntro eyebrow="Support" title="Safety and abuse">
          <p>
            Use this if a companion said something that should not have been said, or if you need the
            house to look at an account. Signed-in notes also live under Feedback.
          </p>
        </PageIntro>
        <SupportForm />
        <p className="text-sm text-muted-foreground">
          Security researchers: see <code>/.well-known/security.txt</code>. Fembo is 16+ only.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
