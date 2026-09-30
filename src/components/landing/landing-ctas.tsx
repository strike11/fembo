import Link from "next/link";
import { DevGuestButton } from "@/components/dev-guest-button";
import { buttonVariants } from "@/components/ui/button";
import { isDevGuestEnabled } from "@/lib/dev-auth";
import { cn } from "@/lib/utils";

export function LandingCtas({
  signedIn,
  align = "start",
}: {
  signedIn: boolean;
  align?: "start" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center" : "items-start",
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={signedIn ? "/app" : "/register"}
          className={cn(buttonVariants({ size: "lg" }), "h-12 rounded-full px-6 text-base")}
        >
          {signedIn ? "Open your room" : "Create a room"}
        </Link>
        <Link
          href={signedIn ? "/app/calls" : "/login"}
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-12 rounded-full px-6 text-base",
          )}
        >
          {signedIn ? "Voice calls" : "Log in"}
        </Link>
        {!signedIn && isDevGuestEnabled() ? (
          <DevGuestButton size="lg" className="h-12 rounded-full px-6 text-base" />
        ) : null}
      </div>
      <p className="text-sm text-muted-foreground">A cute, gentle space for 16+. Create your own femboy companion.</p>
    </div>
  );
}
