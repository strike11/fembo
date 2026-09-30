export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatProviderId = "ollama" | "openrouter";

export type StreamChatOptions = {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  topP?: number;
  repeatPenalty?: number;
  signal?: AbortSignal;
};

export type StreamChatChunk = {
  delta?: string;
  done?: boolean;
  reset?: boolean;
};

export type ChatProviderErrorCode = "provider_error" | "timeout" | "model_blocked";

export class ChatProviderError extends Error {
  readonly code: ChatProviderErrorCode;

  constructor(code: ChatProviderErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export interface ChatProvider {
  readonly id: ChatProviderId;
  streamChat(options: StreamChatOptions): AsyncGenerator<StreamChatChunk, string, void>;
  completeChat(options: StreamChatOptions): Promise<string | null>;
}
