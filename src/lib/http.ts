export function requestId(request?: Request) {
  return request?.headers.get("x-request-id")?.slice(0, 80) || crypto.randomUUID();
}

export function retryAfterSeconds(retryAt?: number) {
  if (!retryAt) return 60;
  return Math.max(1, Math.ceil((retryAt - Date.now()) / 1000));
}

export function noStoreHeaders(request?: Request, retryAfter?: number) {
  const headers = new Headers({
    "Cache-Control": "private, no-store",
    "X-Request-Id": requestId(request),
  });
  if (retryAfter) headers.set("Retry-After", String(retryAfter));
  return headers;
}

export function jsonOk<T>(
  data: T,
  init?: { status?: number; request?: Request; retryAfter?: number },
) {
  const id = requestId(init?.request);
  const headers = noStoreHeaders(init?.request, init?.retryAfter);
  headers.set("X-Request-Id", id);
  return Response.json({ ...data, requestId: id }, { status: init?.status ?? 200, headers });
}

export function jsonError(
  error: string,
  status: number,
  init?: { request?: Request; retryAfter?: number },
) {
  return jsonOk({ error }, { status, request: init?.request, retryAfter: init?.retryAfter });
}

export async function readJsonLimited(request: Request, maxBytes = 16_384) {
  const text = await request.text();
  if (text.length > maxBytes) {
    return { ok: false as const, error: "That payload is too large" };
  }
  try {
    return { ok: true as const, data: JSON.parse(text) as unknown };
  } catch {
    return { ok: false as const, error: "Invalid JSON" };
  }
}
