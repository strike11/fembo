import Link from "next/link";
import { redirect } from "next/navigation";
import { ExportRoom } from "@/components/export-room";
import { PageIntro } from "@/components/page-intro";
import { prisma } from "@/lib/db";
import { formatRelative } from "@/lib/format";
import { getSession } from "@/lib/session";

export default async function DataRightsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const [user, sessions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        createdAt: true,
        lastLoginAt: true,
        ageConfirmedAt: true,
        termsAcceptedAt: true,
      },
    }),
    prisma.session.count({ where: { userId: session.user.id } }),
  ]);
  if (!user) redirect("/login");

  const rows = [
    ["Email", user.email],
    ["Room opened", formatRelative(user.createdAt)],
    ["Last sign-in", user.lastLoginAt ? formatRelative(user.lastLoginAt) : "Not recorded yet"],
    ["Age confirmed", formatRelative(user.ageConfirmedAt)],
    ["Terms accepted", user.termsAcceptedAt ? formatRelative(user.termsAcceptedAt) : "Before this release"],
    ["Open sessions", String(sessions)],
  ];

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Your data" title="What this room holds">
        <p>Export, delete, and see when you last walked in. This is your copy of the house.</p>
      </PageIntro>
      <section className="flex flex-col gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm">{value}</span>
          </div>
        ))}
      </section>
      <ExportRoom />
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/app/sessions" className="hover:underline">
          Sessions
        </Link>
        <Link href="/app/settings" className="hover:underline">
          Delete account
        </Link>
        <Link href="/privacy" className="hover:underline">
          Privacy note
        </Link>
        <Link href="/support" className="hover:underline">
          Support
        </Link>
      </div>
    </main>
  );
}
