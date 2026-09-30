import { applyStreamPiece } from "@/lib/stream-text";
import type { ChatProvider, StreamChatOptions, StreamChatChunk } from "@/lib/chat-provider/types";
import { ChatProviderError } from "@/lib/chat-provider/types";

type OllamaChunk = {
  message?: { content?: string };
  done?: boolean;
};

export class OllamaProvider implements ChatProvider {
  readonly id = "ollama" as const;

  private baseUrl: string;
  private apiKey?: string;

  constructor(env: NodeJS.ProcessEnv = process.env) {
    this.baseUrl = env.OLLAMA_BASE_URL?.trim() || "http://127.0.0.1:11434";
    this.apiKey = env.OLLAMA_API_KEY?.trim() || undefined;
  }

  async *streamChat(options: StreamChatOptions): AsyncGenerator<StreamChatChunk, string, void> {
    const response = await this.request(options, true);
    if (!response.ok || !response.body) {
      throw new ChatProviderError(
        "provider_error",
        "The companion is quiet. Make sure Ollama is running and the model is pulled.",
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
        if (!line.trim()) continue;
        const chunk = JSON.parse(line) as OllamaChunk;
        const piece = chunk.message?.content ?? "";
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
    const payload = (await response.json()) as { message?: { content?: string } };
    const text = payload.message?.content?.trim();
    return text && text.length > 0 ? text : null;
  }

  private request(options: StreamChatOptions, stream: boolean) {
    return fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: options.model,
        stream,
        options: {
          temperature: options.temperature ?? 0.72,
          top_p: options.topP ?? 0.92,
          repeat_penalty: options.repeatPenalty ?? 1.1,
        },
        messages: options.messages,
      }),
      signal: options.signal,
    });
  }
}
