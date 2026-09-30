"use client";

import { useEffect, useState } from "react";

const ROWS = [
  ["Ctrl+K", "Jump anywhere"],
  ["?", "This list"],
  ["Enter", "Send (if enabled)"],
  ["Shift+Enter", "New line"],
];

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
      if (event.key === "?" && !event.ctrlKey && !event.metaKey && !typing) {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4">
      <button type="button" className="absolute inset-0" aria-label="Close shortcuts" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-popover p-5 shadow-xl ring-1 ring-foreground/10">
        <p className="font-heading text-lg font-semibold">Shortcuts</p>
        <div className="mt-3 flex flex-col gap-2">
          {ROWS.map(([key, label]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <kbd className="rounded-md bg-muted px-2 py-0.5 text-xs">{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
