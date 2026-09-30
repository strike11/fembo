import Link from "next/link";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  return (
    <header className="border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" aria-label="Fembo home">
          <Logo className="h-8" />
        </Link>
        <nav className="flex items-center gap-2">
          {signedIn ? (
            <Link href="/app" className={cn(buttonVariants())}>
              Open room
            </Link>
          ) : (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
                Log in
              </Link>
              <Link href="/register" className={cn(buttonVariants())}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
