import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FavoriteButton } from "@/components/favorite-button";
import { PageIntro } from "@/components/page-intro";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { companionExtra } from "@/lib/companions";
import { prisma } from "@/lib/db";
import { visiblePresetWhere } from "@/lib/presets";
import { getSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export default async function ExplorePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [presets, favorites] = await Promise.all([
    prisma.companionPreset.findMany({
      where: visiblePresetWhere(session.user.id),
      orderBy: { name: "asc" },
    }),
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      select: { slug: true },
    }),
  ]);
  const favored = new Set(favorites.map((item) => item.slug));
  const ordered = [...presets].sort((left, right) => Number(favored.has(right.slug)) - Number(favored.has(left.slug)));

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 overflow-y-auto px-4 py-8">
      <PageIntro eyebrow="Explore" title="Rooms you can walk into">
        <p>House rooms plus anyone you made. Voice calls. A personality you can tune.</p>
      </PageIntro>
      <Link href="/app/create" className={cn(buttonVariants({ variant: "outline" }), "w-fit")}>
        Create your femboy
      </Link>
      <div className="grid gap-5 lg:grid-cols-2">
        {ordered.map((preset) => {
          const extra = companionExtra(preset.slug, preset.tagline);
          return (
            <article
              key={preset.id}
              className="min-w-0 overflow-hidden rounded-3xl bg-card ring-1 ring-border"
            >
              <div className="grid min-w-0 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)]">
                <Image
                  src={preset.avatarPath}
                  alt=""
                  width={400}
                  height={500}
                  className="h-full min-h-52 w-full max-w-full object-cover"
                />
                <div className="flex min-w-0 flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading text-xl font-semibold">{preset.name}</h2>
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span className="text-xs text-muted-foreground">Available</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{extra.vibe}</p>
                    </div>
                    <FavoriteButton slug={preset.slug} initial={favored.has(preset.slug)} />
                  </div>
                  <p className="text-sm leading-6 text-foreground/80">{preset.lore}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{preset.kind === "furry" ? "Furry" : "Human"}</Badge>
                    {extra.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <Link href={`/app/companions/${preset.slug}`} className={cn(buttonVariants())}>
                      Open chat
                    </Link>
                    <Link
                      href={`/app/companions/${preset.slug}/visual`}
                      className={cn(buttonVariants({ variant: "secondary" }))}
                    >
                      Visual
                    </Link>
                    <Link
                      href={`/app/call/${preset.slug}`}
                      className={cn(buttonVariants({ variant: "outline" }))}
                    >
                      Call
                    </Link>
                    <Link
                      href={`/app/companions/${preset.slug}/configure`}
                      className={cn(buttonVariants({ variant: "ghost" }))}
                    >
                      Tune
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
