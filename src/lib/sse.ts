export async function readSseDeltaStream(
  response: Response,
  onDelta: (full: string) => void,
) {
  if (!response.ok || !response.body) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "The companion could not answer");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.split("\n").find((entry) => entry.startsWith("data: "));
      if (!line) continue;
      const payload = JSON.parse(line.slice(6)) as {
        delta?: string;
        done?: boolean;
        error?: string;
        reset?: boolean;
      };
      if (payload.error) throw new Error(payload.error);
      if (payload.reset) {
        full = "";
        onDelta("");
      }
      if (payload.delta) {
        full += payload.delta;
        onDelta(full);
      }
    }
  }

  return full;
}
