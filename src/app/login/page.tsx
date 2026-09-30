import { Suspense } from "react";
import Link from "next/link";
import { DevGuestButton } from "@/components/dev-guest-button";
import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";
import { isDevGuestEnabled } from "@/lib/dev-auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <Link href="/" aria-label="Fembo home" className="self-center">
          <Logo className="h-10" />
        </Link>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Log in to continue your chats.</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
        {isDevGuestEnabled() ? (
          <div className="flex flex-col gap-2">
            <p className="text-center text-sm text-muted-foreground">or</p>
            <DevGuestButton />
          </div>
        ) : null}
        <p className="text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/register" className="underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
