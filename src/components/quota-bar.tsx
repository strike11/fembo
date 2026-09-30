import Link from "next/link";
import { formatRetryAt, type BillingStatus } from "@/lib/billing-client";
import { asLocale, t } from "@/lib/i18n";

export function QuotaBar({
  status,
  locale = "en",
}: {
  status: BillingStatus | null;
  locale?: string;
}) {
  const lang = asLocale(locale);
  if (!status) return null;
  if (status.plus) {
    return <p className="px-2 text-xs text-muted-foreground">{t(lang, "plusActive")}</p>;
  }
  if (status.remaining === 0) {
    return (
      <p className="px-2 text-xs text-destructive">
        {t(lang, "quotaWait").replace("{when}", formatRetryAt(status.retryAt, lang))}{" "}
        <Link href="/app/plus" className="underline">
          {t(lang, "plusUnlock")}
        </Link>
      </p>
    );
  }
  return (
    <p className="px-2 text-xs text-muted-foreground">
      {t(lang, "quotaLeft").replace("{n}", String(status.remaining ?? status.limit))}
    </p>
  );
}
