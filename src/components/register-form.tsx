"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { COMMON_PASSWORDS, firstZodError, isAtLeast16, registerSchema } from "@/lib/validation";

export function RegisterForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  async function onSubmit(formData: FormData) {
    setError(null);
    const values = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
      ageConfirmed,
      termsAccepted,
    };
    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setError(firstZodError(parsed.error));
      return;
    }
    if (COMMON_PASSWORDS.has(parsed.data.password.toLowerCase())) {
      setError("Choose a less common password");
      return;
    }
    const dob = new Date(`${parsed.data.dateOfBirth}T00:00:00`);
    if (!isAtLeast16(dob)) {
      setError("Fembo is only for people 16 or older");
      return;
    }

    setPending(true);
    const { error: signUpError } = await authClient.signUp.email({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      dateOfBirth: dob,
    });
    setPending(false);

    if (signUpError) {
      setError(signUpError.message ?? "Could not create the account");
      return;
    }
    toast.success("Welcome in. Your space is ready.");
    router.push("/app/explore");
    router.refresh();
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(new FormData(event.currentTarget));
      }}
    >
      <FieldGroup>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="name">Display name</FieldLabel>
          <Input id="name" name="name" autoComplete="name" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
          <FieldDescription>At least 12 characters, with a letter and a number.</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="ageConfirmed"
            checked={ageConfirmed}
            onCheckedChange={(value) => setAgeConfirmed(value === true)}
          />
          <FieldLabel htmlFor="ageConfirmed">I confirm I am 16 or older</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="termsAccepted"
            checked={termsAccepted}
            onCheckedChange={(value) => setTermsAccepted(value === true)}
          />
          <FieldLabel htmlFor="termsAccepted">
            I accept the{" "}
            <a href="/terms" className="underline underline-offset-4" target="_blank" rel="noreferrer">
              terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline underline-offset-4" target="_blank" rel="noreferrer">
              privacy
            </a>{" "}
            notes
          </FieldLabel>
        </Field>
      </FieldGroup>
      {error ? <FieldError>{error}</FieldError> : null}
      <Button type="submit" disabled={pending}>
        {pending ? <Spinner data-icon="inline-start" /> : null}
        Create account
      </Button>
    </form>
  );
}
