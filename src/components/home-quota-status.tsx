import Link from "next/link";
import { formatRetryAt } from "@/lib/billing-client";
import type { Quota } from "@/lib/quota";
import { asLocale, t } from "@/lib/i18n";

export function HomeQuotaStatus({
  quota,
  locale,
}: {
  quota: Quota;
  locale: string;
}) {
  const lang = asLocale(locale);

  if (quota.plus && quota.ok) {
    return (
      <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
        {t(lang, "plusActive")}
      </p>
    );
  }

  if (!quota.ok && quota.remaining === 0) {
    return (
      <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {t(lang, "quotaWait").replace("{when}", formatRetryAt(quota.retryAt?.toISOString() ?? null, lang))}{" "}
        <Link href="/app/plus" className="underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
          {t(lang, "plusUnlock")}
        </Link>
      </p>
    );
  }

  return (
    <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
      {t(lang, "quotaLeft").replace("{n}", String(quota.remaining ?? quota.limit))}
    </p>
  );
}
