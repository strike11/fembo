import Link from "next/link";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#companions", label: "Companions" },
  { href: "/#voice", label: "Voice" },
  { href: "/#house", label: "House" },
  { href: "/#safety", label: "Safety" },
];

export function LandingHeader({
  signedIn,
  tone = "day",
}: {
  signedIn: boolean;
  tone?: "day" | "heat";
}) {
  const dark = tone === "heat";
  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b backdrop-blur-xl",
        dark ? "border-white/10 bg-black/25" : "border-border/60 bg-background/70",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Fembo home">
            {dark ? (
              <Logo variant="white" className="h-8" />
            ) : (
              <>
                <Logo className="h-8 dark:hidden" />
                <Logo variant="white" className="hidden h-8 dark:block" />
              </>
            )}
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            {LINKS.map((item) => (
              <a key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase sm:inline">
            16+
          </span>
          {signedIn ? (
            <Link href="/app" className={cn(buttonVariants(), "rounded-full")}>
              Open room
            </Link>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "rounded-full")}>
                Log in
              </Link>
              <Link href="/register" className={cn(buttonVariants(), "rounded-full")}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
