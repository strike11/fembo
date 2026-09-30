import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusActions } from "@/components/plus-actions";
import { PageIntro } from "@/components/page-intro";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { PLUS_PRICE_USD, plusActive, canDevUnlock, stripeReady } from "@/lib/plus";
import { getQuota } from "@/lib/quota";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function PlusPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const query = await searchParams;

  const [user, quota] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plusUntil: true, stripeCustomerId: true },
    }),
    getQuota(session.user.id),
  ]);
  const plus = plusActive(user?.plusUntil);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Plus" title={`Fembo Plus · $${PLUS_PRICE_USD}/mo`}>
        <p>Your own femboy, a full emotion pack, and no daily message cap.</p>
      </PageIntro>
      {query.ok ? (
        <p className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm">
          Checkout finished. If Plus is not on yet, wait a few seconds and refresh.
        </p>
      ) : null}
      <ul className="flex flex-col gap-2 text-sm leading-6">
        <li>Create a custom femboy in the house voice — same prompt style as Aki and Ren.</li>
        <li>Generate every cute emotion sprite after you lock the main portrait.</li>
        <li>Free accounts get {quota.limit} messages, then wait 24 hours from the last one. Plus is unlimited.</li>
      </ul>
      {!plus && quota.retryAt ? (
        <p className="text-sm text-muted-foreground">
          Free messages used: {quota.used}/{quota.limit}. Next window after{" "}
          {quota.retryAt.toLocaleString()}.
        </p>
      ) : !plus ? (
        <p className="text-sm text-muted-foreground">
          {quota.remaining} free messages left in this 24-hour window.
        </p>
      ) : (
        <p className="text-sm">
          Plus is active
          {user?.plusUntil ? ` until ${user.plusUntil.toLocaleDateString()}` : ""}.
        </p>
      )}
      <PlusActions
        plus={plus}
        stripeReady={stripeReady()}
        canDevUnlock={canDevUnlock()}
        hasCustomer={Boolean(user?.stripeCustomerId)}
      />
      {!stripeReady() ? (
        <p className="text-xs text-muted-foreground">
          Stripe keys are not set. Local unlock works for development.
        </p>
      ) : null}
      <div className="flex gap-3 text-sm">
        <Link href="/app/create" className={cn(buttonVariants({ variant: "outline" }))}>
          Create a femboy
        </Link>
        <Link href="/app/explore" className="hover:underline">
          Back to rooms
        </Link>
      </div>
    </main>
  );
}
