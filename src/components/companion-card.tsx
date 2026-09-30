import Image from "next/image";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { resolveAssetUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";

export function CompanionCard({
  slug,
  name,
  tagline,
  kind,
  avatarPath,
  favored,
}: {
  slug: string;
  name: string;
  tagline: string;
  kind: "human" | "furry";
  avatarPath: string;
  customized: boolean;
  favored: boolean;
}) {
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-2xl bg-card ring-1 ring-border">
      <Link href={`/app/companions/${slug}`} className="block min-w-0">
        <Image
          src={resolveAssetUrl(avatarPath)}
          alt=""
          width={640}
          height={800}
          className="aspect-[4/5] h-auto w-full max-w-full object-cover transition-transform group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-foreground/80 to-transparent p-4 pt-16">
          <div className="flex items-center justify-between gap-2">
            <p className="text-base font-semibold text-background">{name}</p>
            <Badge variant="secondary">{kind === "furry" ? "Furry" : "Human"}</Badge>
          </div>
          <p className="text-sm text-background/80">{tagline}</p>
        </div>
      </Link>
      <FavoriteButton slug={slug} initial={favored} className="absolute top-3 left-3" />
      <div className="absolute top-3 right-3 flex gap-1">
        <Link
          href={`/app/call/${slug}`}
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
        >
          Call
        </Link>
        <Link
          href={`/app/companions/${slug}/configure`}
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
        >
          Tune
        </Link>
      </div>
    </div>
  );
}
