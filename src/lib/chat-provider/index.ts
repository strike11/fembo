import { OllamaProvider } from "@/lib/chat-provider/ollama-provider";
import { OpenRouterProvider } from "@/lib/chat-provider/openrouter-provider";
import { resolveOpenRouterModel } from "@/lib/chat-provider/model-allowlist";
import type { ChatProvider, ChatProviderId } from "@/lib/chat-provider/types";

export {
  DEFAULT_OPENROUTER_MODEL,
  OPENROUTER_MODEL_ALLOWLIST,
  isAllowedOpenRouterModel,
  resolveOpenRouterModel,
} from "@/lib/chat-provider/model-allowlist";
export type {
  ChatMessage,
  ChatProvider,
  ChatProviderErrorCode,
  ChatProviderId,
  StreamChatChunk,
} from "@/lib/chat-provider/types";
export { ChatProviderError } from "@/lib/chat-provider/types";

export const CHAT_STREAM_TIMEOUT_MS = 60_000;
export const CHAT_COMPLETE_TIMEOUT_MS = 12_000;

export function resolveChatProviderId(env: NodeJS.ProcessEnv = process.env): ChatProviderId {
  const explicit = env.CHAT_PROVIDER?.trim().toLowerCase();
  if (explicit === "openrouter" || explicit === "ollama") {
    return explicit;
  }
  if (env.NODE_ENV === "production" && env.OPENROUTER_API_KEY?.trim()) {
    return "openrouter";
  }
  return "ollama";
}

export function createChatProvider(id: ChatProviderId, env: NodeJS.ProcessEnv = process.env) {
  return id === "openrouter" ? new OpenRouterProvider(env) : new OllamaProvider(env);
}

export function getChatProvider(env: NodeJS.ProcessEnv = process.env) {
  return createChatProvider(resolveChatProviderId(env), env);
}

export function resolveChatModel(env: NodeJS.ProcessEnv = process.env) {
  const providerId = resolveChatProviderId(env);
  if (providerId === "openrouter") {
    return resolveOpenRouterModel(env);
  }
  return env.OLLAMA_MODEL?.trim() || "tinydolphin";
}

export function fallbackChatProviderId(
  primary: ChatProviderId,
  env: NodeJS.ProcessEnv = process.env,
): ChatProviderId | null {
  if (env.NODE_ENV === "production") return null;
  if (primary === "ollama" && env.OPENROUTER_API_KEY?.trim()) return "openrouter";
  if (primary === "openrouter" && env.OLLAMA_BASE_URL?.trim()) return "ollama";
  return null;
}

export function resolveChatProviders(env: NodeJS.ProcessEnv = process.env): ChatProvider[] {
  const primary = resolveChatProviderId(env);
  const providers: ChatProvider[] = [];
  try {
    providers.push(createChatProvider(primary, env));
  } catch {
    // Primary provider is unavailable; try fallback below.
  }
  const fallback = fallbackChatProviderId(primary, env);
  if (fallback) {
    try {
      providers.push(createChatProvider(fallback, env));
    } catch {
      // Fallback provider is unavailable.
    }
  }
  if (providers.length === 0) {
    providers.push(new OllamaProvider(env));
  }
  return providers;
}
