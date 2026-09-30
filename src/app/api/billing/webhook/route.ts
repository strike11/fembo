import { handlePaymentWebhook } from "@/lib/payments";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { response } = await handlePaymentWebhook(request);
  return response;
}
