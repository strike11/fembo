import Link from "next/link";
import { DevGuestButton } from "@/components/dev-guest-button";
import { RegisterForm } from "@/components/register-form";
import { Logo } from "@/components/logo";
import { isDevGuestEnabled } from "@/lib/dev-auth";

export default function RegisterPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <Link href="/" aria-label="Fembo home" className="self-center">
          <Logo className="h-10" />
        </Link>
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Fembo is for adults 21 and older. Passwords are hashed with Argon2id.
          </p>
        </div>
        <RegisterForm />
        {isDevGuestEnabled() ? (
          <div className="flex flex-col gap-2">
            <p className="text-center text-sm text-muted-foreground">или</p>
            <DevGuestButton />
          </div>
        ) : null}
        <p className="text-center text-sm text-muted-foreground">
          Already here?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
