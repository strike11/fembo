import { prisma } from "@/lib/db";
import { APP_CHANNEL, APP_VERSION } from "@/lib/version";

async function checkOllama() {
  const base = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(`${base}/api/tags`, { signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export async function getHealth() {
  let db = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = true;
  } catch {
    db = false;
  }
  const ollama = await checkOllama();
  return {
    ok: db,
    version: APP_VERSION,
    channel: APP_CHANNEL,
    db,
    ollama,
    uptimeSec: Math.round(process.uptime()),
    time: new Date().toISOString(),
  };
}
