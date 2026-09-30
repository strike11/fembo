import { getHealth } from "@/lib/health";
import { jsonOk } from "@/lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const health = await getHealth();
  return jsonOk(health, { status: health.ok ? 200 : 503, request });
}
