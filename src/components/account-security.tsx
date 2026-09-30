"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AccountSecurity({ email }: { email: string }) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirm, setConfirm] = useState("");

  async function changePassword() {
    const response = await fetch("/api/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      toast.error(payload.error ?? "Could not change password");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    toast.success("Password updated. Other devices were signed out.");
  }

  async function removeAccount() {
    const response = await fetch("/api/account", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: confirmEmail, confirm }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      toast.error(payload.error ?? "Could not delete the room");
      return;
    }
    toast.success("The room is gone");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-card p-4 ring-1 ring-border">
        <p className="text-sm font-medium">Change password</p>
        <div className="mt-3 flex flex-col gap-2">
          <Input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Current password"
          />
          <Input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New password, 12+ characters"
          />
          <Button type="button" variant="outline" onClick={() => void changePassword()}>
            Update password
          </Button>
        </div>
      </section>
      <section className="rounded-2xl bg-card p-4 ring-1 ring-destructive/40">
        <p className="text-sm font-medium">Delete account</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Type {email} and DELETE. Chats, calls, and keeps go with it.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Input value={confirmEmail} onChange={(event) => setConfirmEmail(event.target.value)} placeholder={email} />
          <Input value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="DELETE" />
          <Button type="button" variant="destructive" onClick={() => void removeAccount()}>
            Delete my room
          </Button>
        </div>
      </section>
    </div>
  );
}
