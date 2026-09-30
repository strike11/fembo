import { siteUrl } from "@/lib/site";

export function GET() {
  const base = siteUrl();
  const body = [
    `Contact: ${base}/support`,
    "Preferred-Languages: en, ru",
    `Canonical: ${base}/.well-known/security.txt`,
    "Expires: 2027-09-14T00:00:00.000Z",
    "Policy: Age-restricted adult companion. No minors. Report unsafe model output via /support.",
  ].join("\n");
  return new Response(`${body}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
