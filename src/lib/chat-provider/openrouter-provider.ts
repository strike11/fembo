import { applyStreamPiece } from "@/lib/stream-text";
import type { ChatProvider, StreamChatOptions, StreamChatChunk } from "@/lib/chat-provider/types";
import { ChatProviderError } from "@/lib/chat-provider/types";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";

type OpenRouterChunk = {
  choices?: Array<{
    delta?: { content?: string };
    finish_reason?: string | null;
  }>;
  error?: { message?: string; code?: string | number };
};

export class OpenRouterProvider implements ChatProvider {
  readonly id = "openrouter" as const;

  private apiKey: string;
  private referer: string;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    const apiKey = env.OPENROUTER_API_KEY?.trim();
    if (!apiKey) {
      throw new ChatProviderError("provider_error", "OPENROUTER_API_KEY is not configured");
    }
    this.apiKey = apiKey;
    this.referer = env.BETTER_AUTH_URL?.trim() || "http://localhost:3000";
  }

  async *streamChat(options: StreamChatOptions): AsyncGenerator<StreamChatChunk, string, void> {
    const response = await this.request(options, true);
    if (!response.ok || !response.body) {
      const blocked = response.status === 403 || response.status === 451;
      throw new ChatProviderError(
        blocked ? "model_blocked" : "provider_error",
        blocked
          ? "This model is blocked for the current request."
          : "OpenRouter could not start the stream.",
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let full = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const payload = line.slice(6).trim();
        if (!payload || payload === "[DONE]") continue;
        const chunk = JSON.parse(payload) as OpenRouterChunk;
        if (chunk.error) {
          throw new ChatProviderError("provider_error", chunk.error.message ?? "OpenRouter error");
        }
        const piece = chunk.choices?.[0]?.delta?.content ?? "";
        const applied = applyStreamPiece(full, piece);
        full = applied.full;
        if (applied.delta) {
          yield { delta: applied.delta };
        }
      }
    }

    return full;
  }

  async completeChat(options: StreamChatOptions): Promise<string | null> {
    const response = await this.request(options, false);
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = payload.choices?.[0]?.message?.content?.trim();
    return text && text.length > 0 ? text : null;
  }

  private request(options: StreamChatOptions, stream: boolean) {
    return fetch(`${OPENROUTER_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
        "HTTP-Referer": this.referer,
        "X-Title": "Fembo",
      },
      body: JSON.stringify({
        model: options.model,
        stream,
        temperature: options.temperature ?? 0.72,
        top_p: options.topP ?? 0.92,
        messages: options.messages,
      }),
      signal: options.signal,
    });
  }
}
