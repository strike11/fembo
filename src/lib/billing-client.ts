export type BillingStatus = {
  plus: boolean;
  plusUntil: string | null;
  remaining: number | null;
  used: number;
  limit: number;
  retryAt: string | null;
  price: number;
  stripeReady: boolean;
  canDevUnlock: boolean;
  hasCustomer: boolean;
};

export async function fetchBillingStatus(): Promise<BillingStatus | null> {
  const response = await fetch("/api/billing/status");
  if (!response.ok) return null;
  return (await response.json()) as BillingStatus;
}

export function formatRetryAt(iso: string | null, locale: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(locale === "ru" ? "ru-RU" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
