import Link from "next/link";
import { APP_VERSION } from "@/lib/version";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 px-4 py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>Fembo {APP_VERSION} · 16+ gentle platform</p>
        <nav className="flex flex-wrap gap-3">
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/age" className="hover:underline">
            Age
          </Link>
          <Link href="/whats-new" className="hover:underline">
            What’s new
          </Link>
          <Link href="/uptime" className="hover:underline">
            Status
          </Link>
          <Link href="/support" className="hover:underline">
            Support
          </Link>
        </nav>
      </div>
    </footer>
  );
}
