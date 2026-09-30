export const DEFAULT_OLLAMA_MODEL = "tinydolphin";

export function defaultOllamaModel() {
  return process.env.OLLAMA_MODEL ?? DEFAULT_OLLAMA_MODEL;
}
