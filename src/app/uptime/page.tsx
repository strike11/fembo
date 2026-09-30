import { PageIntro } from "@/components/page-intro";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getHealth } from "@/lib/health";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function UptimePage() {
  const [session, health] = await Promise.all([getSession(), getHealth()]);
  const rows = [
    ["App", health.ok ? "Up" : "Degraded"],
    ["Database", health.db ? "Up" : "Down"],
    ["Companion model", health.ollama ? "Up" : "Quiet"],
    ["Version", health.version],
    ["Channel", health.channel],
    ["Process uptime", `${health.uptimeSec}s`],
  ];

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader signedIn={Boolean(session)} />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-8 px-4 py-12">
        <PageIntro eyebrow="Status" title="How the house is sitting">
          <p>A public heartbeat. No account details leave this page.</p>
        </PageIntro>
        <div className="flex flex-col gap-2">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
              <span className="text-sm">{label}</span>
              <span className="text-sm text-muted-foreground">{value}</span>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
