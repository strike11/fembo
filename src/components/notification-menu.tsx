"use client";

import { BellIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelative } from "@/lib/format";

type Note = {
  id: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
};

export function NotificationMenu() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [quiet, setQuiet] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([fetch("/api/notifications"), fetch("/api/settings")])
      .then(async ([notesRes, settingsRes]) => {
        if (!active) return;
        if (notesRes.ok) {
          const payload = (await notesRes.json()) as { notifications?: Note[] };
          if (active) setNotes(payload.notifications ?? []);
        }
        if (settingsRes.ok) {
          const payload = (await settingsRes.json()) as {
            settings?: { doNotDisturb?: boolean };
          };
          if (active) setQuiet(payload.settings?.doNotDisturb ?? false);
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const unread = notes.filter((note) => !note.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Notifications"
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "relative")}
      >
        <BellIcon className="size-4" />
        {unread > 0 && !quiet ? (
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-primary" />
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        {notes.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">Nothing yet. Start a chat or call.</p>
        ) : (
          notes.slice(0, 8).map((note) => (
            <DropdownMenuItem key={note.id} className="items-start">
              <Link
                href={note.href}
                className="flex flex-col gap-0.5"
                onClick={() => {
                  void fetch("/api/notifications", { method: "PATCH" });
                }}
              >
                <span className="font-medium">{note.title}</span>
                <span className="text-xs text-muted-foreground">{note.body}</span>
                <span className="text-xs text-muted-foreground">{formatRelative(note.createdAt)}</span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
