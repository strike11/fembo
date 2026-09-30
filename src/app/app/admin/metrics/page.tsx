import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { canViewAdminMetrics } from "@/lib/analytics";
import { getBetaMetricsSnapshot } from "@/lib/analytics-metrics";
import { getSession } from "@/lib/session";

function MetricCard({
  label,
  value,
  hint,
  target,
}: {
  label: string;
  value: string;
  hint?: string;
  target?: string;
}) {
  return (
    <div className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      {target ? <p className="mt-1 text-xs text-muted-foreground">Target: {target}</p> : null}
    </div>
  );
}

function pct(value: number | null) {
  if (value === null) {
    return "—";
  }
  return `${value}%`;
}

export default async function AdminMetricsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  if (!canViewAdminMetrics(session.user.email)) {
    redirect("/app");
  }

  const metrics = await getBetaMetricsSnapshot(30);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Admin" title="Beta metrics">
        <p>
          Privacy-friendly first-party events for the last {metrics.windowDays} days. Message text is
          never stored in analytics.
        </p>
      </PageIntro>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Signups" value={String(metrics.signups)} />
        <MetricCard
          label="Signup → first reply"
          value={pct(metrics.signupToFirstReplyPct)}
          hint={`First chat event: ${pct(metrics.signupToFirstChatPct)}`}
          target="≥ 40%"
        />
        <MetricCard
          label="Signup → 10 messages"
          value={pct(metrics.signupToTenMessagesPct)}
          target="≥ 25%"
        />
        <MetricCard label="D7 return" value={pct(metrics.d7RetentionPct)} target="≥ 15%" />
        <MetricCard
          label="Provider success"
          value={pct(metrics.providerSuccessPct)}
          hint={`${metrics.usageCompleted} ok · ${metrics.usageFailed} failed`}
          target="≥ 98%"
        />
        <MetricCard
          label="First-token p95"
          value={metrics.firstTokenP95Ms === null ? "—" : `${metrics.firstTokenP95Ms} ms`}
          target="≤ 4000 ms"
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Visual opens" value={String(metrics.visualOpens)} />
        <MetricCard label="Call starts" value={String(metrics.callStarts)} />
        <MetricCard label="Quota hits" value={String(metrics.quotaHits)} />
        <MetricCard label="Checkout starts" value={String(metrics.checkoutStarts)} />
        <MetricCard label="Paid events" value={String(metrics.paidEvents)} />
        <MetricCard label="Cancel events" value={String(metrics.cancelEvents)} />
        <MetricCard label="Provider errors" value={String(metrics.providerErrors)} />
        <MetricCard
          label="Estimated inference cost"
          value={`$${metrics.totalCostUsd.toFixed(4)}`}
          hint={`${metrics.paidUsers} active paid users in window`}
        />
      </section>
    </main>
  );
}
