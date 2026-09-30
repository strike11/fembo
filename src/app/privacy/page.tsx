import { PageIntro } from "@/components/page-intro";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSession } from "@/lib/session";

export const PRIVACY_LAST_UPDATED = "2026-09-18";
export const SUPPORT_EMAIL = "support@example.com";
export const PRIVACY_CONTACT = "privacy@example.com";

export const PRIVACY_SECTIONS = [
  "Overview",
  "Data we collect",
  "AI providers and inference",
  "How we use data",
  "Retention",
  "Deletion and export",
  "Payment processors",
  "Moderation and safety logs",
  "Cookies and analytics",
  "International transfers",
  "Your choices",
  "Contact",
] as const;

export default async function PrivacyPage() {
  const session = await getSession();
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader signedIn={Boolean(session)} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-4 py-12">
        <PageIntro eyebrow="Privacy Policy" title="Fembo Privacy Policy">
          <p>
            Last updated: {PRIVACY_LAST_UPDATED}. This policy describes how Fembo collects, uses,
            stores, and deletes personal data for our 16+ companion service. This is not
            legal advice.
          </p>
        </PageIntro>

        <div className="flex flex-col gap-8 text-sm leading-7 text-muted-foreground">
          <section>
            <h2 className="mb-2 font-medium text-foreground">1. Overview</h2>
            <p>
              Fembo is operated as a private companion product for users 16 and older. We minimize
              data collection to what is needed to run accounts, conversations, billing, and safety
              controls. We do not sell your chat transcripts to advertisers.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-foreground">2. Data we collect</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Account data: email, display name, date of birth, age confirmation timestamp</li>
              <li>Profile and settings: locale, companion configuration</li>
              <li>Conversation data: messages, memories, bookmarks, call summaries, scene state</li>
              <li>Billing identifiers: subscription status, processor customer IDs (not full card numbers)</li>
              <li>Technical data: session tokens, IP address and user agent on login (where logged)</li>
              <li>Safety data: reports, moderation incident metadata, audit logs for account actions</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-foreground">3. AI providers and inference</h2>
            <p>
              Chat, call, and regeneration features send conversation context to our configured AI
              inference provider (currently OpenRouter, which routes to underlying model vendors).
              Prompts include companion identity, recent messages, selected memories, and safety
              instructions. We do not intentionally send payment card data to AI providers.
            </p>
            <p className="mt-2">
              Provider retention and subprocessors are governed by their terms. We select models
              from an server allowlist and apply usage limits to control cost and abuse.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-foreground">4. How we use data</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Provide and personalize the companion experience</li>
              <li>Enforce age, content, quota, and moderation policies</li>
              <li>Process subscriptions and prevent billing fraud</li>
              <li>Respond to support, abuse reports, and legal obligations</li>
              <li>Maintain security, debugging, and service reliability</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-foreground">5. Retention</h2>
            <p>
              Active account data is retained while your account exists. Conversation history and
              memories persist until you delete them or delete your account. Billing webhook event
              records are retained for idempotency and dispute evidence (typically up to 24 months).
              Moderation incident records may be retained longer when required for processor audits
              or legal compliance. Inactive accounts may be purged after extended dormancy with notice
              where feasible.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-foreground">6. Deletion and export</h2>
            <p>
              You may export your room data as JSON and delete your account from Settings or{" "}
              <a href="/app/data" className="underline">
                Your data
              </a>
              . Account deletion removes your user record and cascaded personal data from our primary
              database. Backups may persist for a limited period before rotation. Cancel active
              subscriptions before deletion to avoid further charges.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-foreground">7. Payment processors</h2>
            <p>
              Subscriptions are processed by Stripe today. When approved for adult billing in your
              region, we may offer CCBill, Segpay, or similar processors. Those companies receive
              billing contact information and payment credentials directly; Fembo stores processor
              customer and subscription IDs, not full card numbers. Processor privacy policies apply
              to their handling of payment data.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-foreground">8. Moderation and safety logs</h2>
            <p>
              Automated pre- and post-model checks may hash or flag content categories without storing
              full message text in incident records unless escalation requires it. User reports and
              audit logs help us investigate abuse and demonstrate compliance to payment partners.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-foreground">9. Cookies and analytics</h2>
            <p>
              Fembo uses essential session cookies for authentication. During beta we use
              privacy-oriented first-party product events (signup, quota hit, checkout) without
              sending message text to analytics vendors. Third-party ad SDKs are not used in chat.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-foreground">10. International transfers</h2>
            <p>
              Data may be processed in the United States or other regions where our infrastructure
              and subprocessors operate. By using Fembo you acknowledge such transfers may occur subject
              to applicable safeguards.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-foreground">11. Your choices</h2>
            <p>
              You can adjust companion boundaries, export data, and delete your account.
              Email{" "}
              <a href={`mailto:${PRIVACY_CONTACT}`} className="underline">
                {PRIVACY_CONTACT}
              </a>{" "}
              for privacy requests. We may need to verify account ownership before fulfilling requests.
            </p>
          </section>

          <section>
            <h2 className="mb-2 font-medium text-foreground">12. Contact</h2>
            <p>
              Privacy:{" "}
              <a href={`mailto:${PRIVACY_CONTACT}`} className="underline">
                {PRIVACY_CONTACT}
              </a>
              . General support:{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
