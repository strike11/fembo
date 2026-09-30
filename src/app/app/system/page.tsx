import { redirect } from "next/navigation";
import { PageIntro } from "@/components/page-intro";
import { getHealth } from "@/lib/health";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { APP_CHANNEL, APP_VERSION } from "@/lib/version";

export default async function SystemPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const [health, audits] = await Promise.all([
    getHealth(),
    prisma.auditLog.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="System" title="The house internals">
        <p>
          Fembo {APP_VERSION} · {APP_CHANNEL}. If the model is quiet, chat still stores your line.
        </p>
      </PageIntro>
      <section className="grid gap-2 sm:grid-cols-3">
        {[
          ["Database", health.db ? "Up" : "Down"],
          ["Model", health.ollama ? "Up" : "Quiet"],
          ["App", health.ok ? "Ready" : "Degraded"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">{value}</p>
          </div>
        ))}
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="font-heading text-lg font-semibold">Recent account events</h2>
        {audits.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing sensitive has been logged yet.</p>
        ) : (
          audits.map((item) => (
            <div key={item.id} className="rounded-2xl bg-card px-4 py-3 text-sm ring-1 ring-border">
              <p>{item.action}</p>
              <p className="text-xs text-muted-foreground">
                {item.detail || "—"} · {item.createdAt.toISOString().slice(0, 16).replace("T", " ")}
              </p>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
