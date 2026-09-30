import { jsonError, jsonOk, retryAfterSeconds } from "@/lib/http";
import { clientKey, isSameOrigin, rateLimit } from "@/lib/security";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 3_000_000;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("Invalid origin", 403, { request });
  }
  const session = await getSession();
  if (!session) {
    return jsonError("Sign in first", 401, { request });
  }
  const limited = await rateLimit(`transcribe:${session.user.id}:${clientKey(request)}`, 20, 60_000);
  if (!limited.ok) {
    return jsonError("Slow down a little", 429, {
      request,
      retryAfter: retryAfterSeconds(limited.retryAt),
    });
  }

  const groqKey = process.env.GROQ_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const baseUrl = groqKey
    ? "https://api.groq.com/openai/v1/audio/transcriptions"
    : openAiKey
      ? `${process.env.OPENAI_BASE_URL?.replace(/\/$/, "") || "https://api.openai.com/v1"}/audio/transcriptions`
      : null;
  const apiKey = groqKey || openAiKey;
  if (!baseUrl || !apiKey) {
    return jsonError("No server speech engine", 501, { request });
  }

  const form = await request.formData();
  const audio = form.get("audio");
  if (!(audio instanceof File) || audio.size < 64 || audio.size > MAX_BYTES) {
    return jsonError("Record a short line and try again", 400, { request });
  }

  const outbound = new FormData();
  outbound.append("file", audio, audio.name || "speech.wav");
  outbound.append("model", groqKey ? "whisper-large-v3-turbo" : "whisper-1");
  outbound.append("response_format", "json");

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: outbound,
  });
  if (!response.ok) {
    return jsonError("Could not transcribe that clip", 502, { request });
  }
  const payload = (await response.json()) as { text?: string };
  return jsonOk({ text: payload.text?.trim() ?? "" }, { request });
}
