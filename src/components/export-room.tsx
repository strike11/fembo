"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ExportRoom() {
  async function download() {
    const response = await fetch("/api/export");
    if (!response.ok) {
      toast.error("Could not export");
      return;
    }
    const payload = await response.json();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "fembo-room.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Export downloaded");
  }

  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-border">
      <p className="text-sm font-medium">Export your room</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Chats, settings, memories, letters, calls, reports, and audit events — as one JSON file.
      </p>
      <Button className="mt-3" variant="outline" onClick={() => void download()}>
        Download everything
      </Button>
    </div>
  );
}
