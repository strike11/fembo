import { encodeWav, resampleMono } from "@/lib/wav";

export type WhisperStatus = "uploading" | "downloading" | "transcribing";

type Asr = (
  audio: string,
  options?: { task?: "transcribe"; language?: string },
) => Promise<{ text?: string } | Array<{ text?: string }>>;

let pipelinePromise: Promise<Asr | null> | null = null;

function modelHost() {
  if (typeof window === "undefined") return "/api/models";
  return `${window.location.origin}/api/models`;
}

async function loadPipeline(onStatus?: (status: WhisperStatus, progress?: number) => void) {
  const { pipeline, env } = await import("@huggingface/transformers");
  env.allowRemoteModels = true;
  env.remoteHost = `${modelHost()}/`;
  env.remotePathTemplate = "{model}/resolve/{revision}/";
  const backends = ((env as { backends?: Record<string, unknown> }).backends ??= {});
  const onnx = ((backends.onnx as Record<string, unknown> | undefined) ??= {});
  const wasm = ((onnx.wasm as Record<string, unknown> | undefined) ??= {});
  wasm.numThreads = 1;
  wasm.proxy = false;
  wasm.wasmPaths = "/ort/";
  return pipeline("automatic-speech-recognition", "Xenova/whisper-tiny", {
    dtype: "q8",
    progress_callback: (entry: { status?: string; loaded?: number; total?: number }) => {
      if (entry.status === "progress" && entry.total) {
        onStatus?.("downloading", Math.round(((entry.loaded ?? 0) / entry.total) * 100));
      }
    },
  }) as unknown as Promise<Asr>;
}

async function getPipeline(onStatus?: (status: WhisperStatus, progress?: number) => void) {
  if (!pipelinePromise) {
    pipelinePromise = loadPipeline(onStatus).catch((error) => {
      pipelinePromise = null;
      console.warn("Speech engine unavailable", error);
      return null;
    });
  }
  return pipelinePromise;
}

async function transcribeLocal(
  samples: Float32Array,
  sampleRate: number,
  onStatus?: (status: WhisperStatus, progress?: number) => void,
) {
  onStatus?.("downloading");
  const asr = await getPipeline(onStatus);
  if (!asr) {
    throw new Error("Speech engine unavailable");
  }
  onStatus?.("transcribing");
  const wav = encodeWav(resampleMono(samples, sampleRate, 16_000), 16_000);
  const url = URL.createObjectURL(wav);
  try {
    const result = await asr(url, { task: "transcribe", language: "english" });
    const text = Array.isArray(result) ? result[0]?.text : result.text;
    return text?.trim() ?? "";
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function warmupSpeechEngine() {
  if (typeof window === "undefined") return;
  void getPipeline();
}

export async function transcribeUtterance(
  samples: Float32Array,
  sampleRate: number,
  onStatus?: (status: WhisperStatus, progress?: number) => void,
) {
  const wav = encodeWav(resampleMono(samples, sampleRate, 16_000), 16_000);
  try {
    onStatus?.("uploading");
    const body = new FormData();
    body.append("audio", wav, "speech.wav");
    const response = await fetch("/api/transcribe", { method: "POST", body });
    if (response.ok) {
      const payload = (await response.json()) as { text?: string };
      const text = payload.text?.trim();
      if (text) return text;
    }
  } catch {
    // local whisper
  }
  return transcribeLocal(samples, sampleRate, onStatus);
}
