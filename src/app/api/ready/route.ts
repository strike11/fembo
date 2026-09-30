import { jsonOk } from "@/lib/http";
import { APP_CHANNEL, APP_VERSION } from "@/lib/version";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return jsonOk(
    { ok: true, live: true, version: APP_VERSION, channel: APP_CHANNEL },
    { request },
  );
}
