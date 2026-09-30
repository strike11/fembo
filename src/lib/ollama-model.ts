import { resolveChatModel } from "@/lib/chat-provider";

export { DEFAULT_OPENROUTER_MODEL, OPENROUTER_MODEL_ALLOWLIST } from "@/lib/chat-provider";
export { DEFAULT_OLLAMA_MODEL, defaultOllamaModel } from "@/lib/ollama-models";

/** @deprecated Use resolveChatModel from @/lib/chat-provider */
export function resolveOllamaModel() {
  return resolveChatModel();
}
