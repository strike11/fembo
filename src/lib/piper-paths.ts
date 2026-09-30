export const HF_BASE = "https://huggingface.co/diffusionstudio/piper-voices/resolve/main";

export function piperModelPath(voiceId: string) {
  const match = voiceId.match(
    /^([a-z]{2})_([A-Z]{2})-([a-z0-9_]+)-(x_low|low|medium|high)$/,
  );
  if (!match) return null;
  const [, lang, region, name, quality] = match;
  return `${lang}/${lang}_${region}/${name}/${quality}/${voiceId}.onnx`;
}
