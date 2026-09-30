"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

const WARN_MS = 25 * 60_000;
const OUT_MS = 30 * 60_000;

export function IdleGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const [warn, setWarn] = useState(false);
  const lastRef = useRef(0);

  useEffect(() => {
    if (pathname.startsWith("/app/call/")) return;
    lastRef.current = Date.now();

    function touch() {
      lastRef.current = Date.now();
      setWarn(false);
    }

    const events = ["pointerdown", "keydown", "mousemove", "touchstart"];
    for (const name of events) window.addEventListener(name, touch, { passive: true });

    const timer = window.setInterval(() => {
      const idle = Date.now() - lastRef.current;
      if (idle >= OUT_MS) {
        void authClient.signOut().then(() => {
          router.push("/login");
          router.refresh();
        });
        return;
      }
      setWarn(idle >= WARN_MS);
    }, 15_000);

    return () => {
      for (const name of events) window.removeEventListener(name, touch);
      window.clearInterval(timer);
    };
  }, [pathname, router]);

  if (!warn) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex max-w-lg items-center gap-3 rounded-2xl bg-popover px-4 py-3 text-sm shadow-xl ring-1 ring-border">
        <p>Still there? The room will lock in a few minutes.</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => {
            lastRef.current = Date.now();
            setWarn(false);
          }}
        >
          I&apos;m here
        </Button>
      </div>
    </div>
  );
}
