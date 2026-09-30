import {
  CHAT_COMPLETE_TIMEOUT_MS,
  getChatProvider,
  resolveChatModel,
  resolveChatProviders,
} from "@/lib/chat-provider";

export async function completeCompanionChat(system: string, user: string) {
  const messages = [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
  const model = resolveChatModel();

  for (const provider of resolveChatProviders()) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CHAT_COMPLETE_TIMEOUT_MS);
    try {
      const providerModel =
        provider.id === "openrouter" && !model.includes("/") ? resolveChatModel() : model;
      const text = await provider.completeChat({
        model: providerModel,
        messages,
        temperature: 0.7,
        topP: 0.9,
        signal: controller.signal,
      });
      if (text) return text;
    } catch {
      // Try fallback provider in dev when configured.
    } finally {
      clearTimeout(timer);
    }
  }

  return null;
}

/** @deprecated Use completeCompanionChat */
export async function ollamaComplete(system: string, user: string) {
  return completeCompanionChat(system, user);
}

export function getDefaultChatProvider() {
  return getChatProvider();
}
