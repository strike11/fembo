import Link from "next/link";
import { asLocale, t } from "@/lib/i18n";

export function OnboardingCard({
  steps,
  locale = "en",
}: {
  steps: Array<{ label: string; href?: string; done: boolean }>;
  locale?: string;
}) {
  const lang = asLocale(locale);
  const remaining = steps.filter((step) => !step.done);
  if (remaining.length === 0) return null;

  return (
    <section
      className="rounded-2xl bg-card p-4 ring-1 ring-border"
      aria-label={t(lang, "onboardingTitle")}
    >
      <p className="text-sm font-medium">{t(lang, "onboardingTitle")}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t(lang, "onboardingHint")}</p>
      <ol className="mt-3 flex flex-col gap-2">
        {steps.map((step) => (
          <li key={step.label}>
            {step.href && !step.done ? (
              <Link
                href={step.href}
                className="text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                ○ {step.label}
              </Link>
            ) : (
              <span className={`text-sm ${step.done ? "text-muted-foreground line-through" : ""}`}>
                {step.done ? "✓" : "○"} {step.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
