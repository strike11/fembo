import { jsonError } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED = [/^Xenova\/whisper-tiny(?:\/|$)/];
const UPSTREAM = ["https://huggingface.co", "https://hf-mirror.com"];

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const path = (await context.params).path.join("/");
  if (path.includes("..") || !ALLOWED.some((rule) => rule.test(path))) {
    return jsonError("Not found", 404);
  }

  for (const base of UPSTREAM) {
    try {
      const upstream = await fetch(`${base}/${path}`, {
        redirect: "follow",
        headers: { Accept: "*/*", "User-Agent": "fembo-model-proxy" },
      });
      if (!upstream.ok || !upstream.body) continue;
      const type = upstream.headers.get("content-type") ?? "application/octet-stream";
      return new Response(upstream.body, {
        headers: {
          "Content-Type": type,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      // try next host
    }
  }

  return jsonError("Speech model unavailable", 502);
}
