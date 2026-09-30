export const OPENROUTER_MODEL_ALLOWLIST = [
  "google/gemma-2-9b-it:free",
  "mistralai/mistral-7b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct",
  "qwen/qwen-2.5-7b-instruct",
  "openrouter/auto",
] as const;

export type OpenRouterModel = (typeof OPENROUTER_MODEL_ALLOWLIST)[number];

export const DEFAULT_OPENROUTER_MODEL: OpenRouterModel = "google/gemma-2-9b-it:free";

export function isAllowedOpenRouterModel(model: string): model is OpenRouterModel {
  return (OPENROUTER_MODEL_ALLOWLIST as readonly string[]).includes(model);
}

export function resolveOpenRouterModel(env: NodeJS.ProcessEnv = process.env) {
  const configured = env.OPENROUTER_MODEL?.trim() || DEFAULT_OPENROUTER_MODEL;
  if (!isAllowedOpenRouterModel(configured)) {
    throw new Error(`OPENROUTER_MODEL "${configured}" is not in the allowlist`);
  }
  return configured;
}
