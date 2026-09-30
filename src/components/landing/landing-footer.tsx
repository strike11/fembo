import Link from "next/link";
import { Logo } from "@/components/logo";
import { APP_VERSION } from "@/lib/version";

const COLUMNS = [
  {
    title: "Product",
    links: [
      ["/#companions", "Companions"],
      ["/#voice", "Voice calls"],
      ["/app/create", "Create your femboy"],
      ["/whats-new", "What’s new"],
    ],
  },
  {
    title: "Account",
    links: [
      ["/register", "Create a room"],
      ["/login", "Log in"],
      ["/app/data", "Your data"],
      ["/support", "Support"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["/privacy", "Privacy"],
      ["/terms", "Terms"],
      ["/age", "Age"],
      ["/uptime", "Status"],
    ],
  },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-border/70 bg-card/40">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_repeat(3,minmax(0,0.7fr))]">
        <div className="flex flex-col gap-4">
          <Logo className="h-8 w-fit dark:hidden" />
          <Logo variant="white" className="hidden h-8 w-fit dark:block" />
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            A cute, gentle companion house for 16+. Chat, call, and create your own femboy.
          </p>
          <p className="text-xs text-muted-foreground">Fembo {APP_VERSION}</p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <p className="text-sm font-medium">{column.title}</p>
            {column.links.map(([href, label]) => (
              <Link key={href} href={href} className="text-sm text-muted-foreground hover:text-foreground">
                {label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}
