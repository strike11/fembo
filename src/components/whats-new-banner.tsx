"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CHANGELOG } from "@/lib/changelog";

const KEY = "fembo-whats-new";

export function WhatsNewBanner() {
  const latest = CHANGELOG[0];
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!latest) return;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      try {
        setShow(localStorage.getItem(KEY) !== latest.id);
      } catch {
        setShow(true);
      }
    });
    return () => {
      active = false;
    };
  }, [latest]);

  if (!show || !latest) return null;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-card px-4 py-3 ring-1 ring-border">
      <p className="text-sm">
        <span className="font-medium">{latest.title}.</span> {latest.body}{" "}
        <Link href="/whats-new" className="underline">
          Notes
        </Link>
      </p>
      <button
        type="button"
        className="text-xs text-muted-foreground hover:underline"
        onClick={() => {
          try {
            localStorage.setItem(KEY, latest.id);
          } catch {
            /* private mode */
          }
          setShow(false);
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
