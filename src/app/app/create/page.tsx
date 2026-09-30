import Link from "next/link";
import { redirect } from "next/navigation";
import { FemboyBuilder } from "@/components/femboy-builder";
import { PageIntro } from "@/components/page-intro";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { ensureUserSettings } from "@/lib/companion-service";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function CreatePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [settings, drafts] = await Promise.all([
    ensureUserSettings(session.user.id),
    prisma.companionPreset.findMany({
      where: { ownerId: session.user.id },
      orderBy: { name: "asc" },
      select: { slug: true, name: true, tagline: true },
    }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro
        eyebrow={settings.locale === "ru" ? "Создать" : "Create"}
        title={settings.locale === "ru" ? "Собери своего фембойчика" : "Build your femboy"}
      >
        <p>
          {settings.locale === "ru"
            ? "Выбери волосы, глаза, ушки и одежду — превью обновляется сразу. Потом начни чат."
            : "Pick hair, eyes, ears, and outfit — the preview updates live. Then start chatting."}
        </p>
      </PageIntro>

      {drafts.length > 0 ? (
        <section className="flex flex-wrap gap-2">
          {drafts.map((draft) => (
            <Link
              key={draft.slug}
              href={`/app/create/${draft.slug}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              {draft.name}
            </Link>
          ))}
        </section>
      ) : null}

      <FemboyBuilder locale={settings.locale} />
    </main>
  );
}
