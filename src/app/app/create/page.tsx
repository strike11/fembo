import Link from "next/link";
import { redirect } from "next/navigation";
import { FemboyBuilder } from "@/components/femboy-builder";
import { PageIntro } from "@/components/page-intro";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function CreatePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const drafts = await prisma.companionPreset.findMany({
    where: { ownerId: session.user.id },
    orderBy: { name: "asc" },
    select: { slug: true, name: true, tagline: true },
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Create" title="Build your femboy">
        <p>Pick hair, eyes, ears, and outfit. The preview updates live. Then start chatting.</p>
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

      <FemboyBuilder />
    </main>
  );
}
