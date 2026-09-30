"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function AppHeader({ name }: { name: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const isImmersiveChat = /^\/app\/companions\/[^/]+$/.test(pathname);

  if (isImmersiveChat) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/app/companions" aria-label="Fembo companions">
          <Logo className="h-8" />
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/app/companions" className={cn(buttonVariants({ variant: "ghost" }))}>
            Chats
          </Link>
          <Link href="/app/profile" className={cn(buttonVariants({ variant: "ghost" }))}>
            Profile
          </Link>
          <span className="hidden text-sm text-muted-foreground sm:inline">{name}</span>
          <Button
            variant="outline"
            onClick={() => {
              void authClient.signOut({
                fetchOptions: {
                  onSuccess: () => router.push("/"),
                },
              });
            }}
          >
            Sign out
          </Button>
        </nav>
      </div>
    </header>
  );
}
