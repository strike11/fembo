"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { HF_BASE, piperModelPath } from "@/lib/piper-paths";
import { voiceErrorMessage } from "@/lib/stream-text";

type PiperModule = typeof import("@mintplex-labs/piper-tts-web");

export type VoicePhase =
  | "idle"
  | "checking"
  | "downloading"
  | "preparing"
  | "ready"
  | "error";

const WASM_PATHS = {
  onnxWasm: "/ort/",
  piperData:
    "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.data",
  piperWasm:
    "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize.wasm",
};

async function loadPiper(): Promise<PiperModule> {
  return import("@mintplex-labs/piper-tts-web");
}

function pickBrowserVoice() {
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith(navigator.language.slice(0, 2))) ??
    voices.find((voice) => /female|samantha|zira|irina|google/i.test(voice.name)) ??
    voices.find((voice) => voice.lang.startsWith("en")) ??
    voices[0]
  );
}

function speakBrowser(text: string) {
  return new Promise<void>((resolve) => {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = 1.08;
    const voice = pickBrowserVoice();
    if (voice) utterance.voice = voice;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

async function storeVoiceFiles(voiceId: string, onnx: Blob, json: Blob) {
  const path = piperModelPath(voiceId);
  if (!path) {
    throw new Error("Use a Piper voice id like en_US-hfc_female-medium");
  }
  const root = await navigator.storage.getDirectory();
  const dir = await root.getDirectoryHandle("piper", { create: true });
  const onnxName = `${HF_BASE}/${path}`.split("/").at(-1);
  const jsonName = `${HF_BASE}/${path}.json`.split("/").at(-1);
  if (!onnxName || !jsonName) {
    throw new Error("Could not store the voice files");
  }
  for (const [name, blob] of [
    [onnxName, onnx],
    [jsonName, json],
  ] as const) {
    const file = await dir.getFileHandle(name, { create: true });
    const writable = await file.createWritable();
    await writable.write(blob);
    await writable.close();
  }
}

function isCorruptVoice(error: unknown) {
  const raw = error instanceof Error ? error.message : String(error);
  return /protobuf|no graph|ERROR_CODE:\s*2/i.test(raw);
}

export async function downloadPiperVoice(
  voiceId: string,
  onProgress?: (percent: number) => void,
) {
  const tts = await loadPiper();
  await tts.download(voiceId, (progress) => {
    if (progress.total) {
      onProgress?.(Math.round((progress.loaded / progress.total) * 100));
    }
  });
}

export async function saveCustomPiperVoice(
  voiceId: string,
  onnxFile: File,
  jsonFile: File,
) {
  await storeVoiceFiles(voiceId, onnxFile, jsonFile);
}

export function usePiper(voiceId: string, enabled: boolean) {
  const queueRef = useRef<string[]>([]);
  const playingRef = useRef(false);
  const voiceRef = useRef(voiceId);
  const sessionRef = useRef<InstanceType<PiperModule["TtsSession"]> | null>(null);
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const idleResolvers = useRef<Array<() => void>>([]);

  useEffect(() => {
    voiceRef.current = voiceId;
    queueRef.current = [];
    sessionRef.current = null;
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setPhase("idle");
      setProgress(0);
      setReady(false);
      setError(null);
    });
    return () => {
      active = false;
    };
  }, [voiceId]);

  const createSession = useCallback(async (tts: PiperModule) => {
    tts.TtsSession._instance = null;
    const session = await tts.TtsSession.create({
      voiceId: voiceRef.current,
      wasmPaths: WASM_PATHS,
    });
    sessionRef.current = session;
    return session;
  }, []);

  const downloadVoice = useCallback(async (tts: PiperModule) => {
    setPhase("downloading");
    setProgress(0);
    setStatus("Голос качается…");
    await tts.download(voiceRef.current, (entry) => {
      if (entry.total) {
        const percent = Math.round((entry.loaded / entry.total) * 100);
        setProgress(percent);
        setStatus(`Голос ${percent}%`);
      }
    });
    setProgress(100);
  }, []);

  const ensureSession = useCallback(async () => {
    if (sessionRef.current && sessionRef.current.voiceId === voiceRef.current) {
      return sessionRef.current;
    }
    const tts = await loadPiper();
    const stored = await tts.stored();
    if (!stored.includes(voiceRef.current)) {
      await downloadVoice(tts);
    }
    setPhase("preparing");
    setStatus("Собираем голос…");
    try {
      return await createSession(tts);
    } catch (error) {
      if (!isCorruptVoice(error)) {
        throw error;
      }
      await tts.remove(voiceRef.current);
      sessionRef.current = null;
      await downloadVoice(tts);
      setPhase("preparing");
      setStatus("Собираем голос…");
      return await createSession(tts);
    }
  }, [createSession, downloadVoice]);

  const prepare = useCallback(async () => {
    setError(null);
    setUsingFallback(false);
    setReady(false);
    setPhase("checking");
    setStatus("Проверяем голос…");
    try {
      const tts = await loadPiper();
      const stored = await tts.stored();
      if (stored.includes(voiceRef.current)) {
        setProgress(72);
      }
      await ensureSession();
      setUsingFallback(false);
      setReady(true);
      setPhase("ready");
      setProgress(100);
      setStatus(null);
    } catch (caught) {
      setReady(false);
      setPhase("error");
      setError(voiceErrorMessage(caught));
      setStatus(voiceErrorMessage(caught));
    }
  }, [ensureSession]);

  const waitUntilIdle = useCallback(() => {
    if (!playingRef.current && queueRef.current.length === 0) return Promise.resolve();
    return new Promise<void>((resolve) => {
      idleResolvers.current.push(resolve);
    });
  }, []);

  const drain = useCallback(async () => {
    if (playingRef.current) return;
    playingRef.current = true;
    setSpeaking(true);
    try {
      while (queueRef.current.length) {
        const next = queueRef.current.shift();
        if (!next) continue;
        try {
          const session = await ensureSession();
          const wav = await session.predict(next);
          const url = URL.createObjectURL(wav);
          await new Promise<void>((resolve) => {
            const audio = new Audio(url);
            audio.onended = () => {
              URL.revokeObjectURL(url);
              resolve();
            };
            audio.onerror = () => {
              URL.revokeObjectURL(url);
              resolve();
            };
            void audio.play().catch(() => resolve());
          });
        } catch (caught) {
          setUsingFallback(true);
          setStatus(voiceErrorMessage(caught));
          await speakBrowser(next);
        }
      }
    } finally {
      playingRef.current = false;
      if (queueRef.current.length) {
        void drain();
      } else {
        setSpeaking(false);
        const resolvers = idleResolvers.current;
        idleResolvers.current = [];
        for (const resolve of resolvers) resolve();
      }
    }
  }, [ensureSession]);

  const speak = useCallback(
    (text: string) => {
      if (!enabled) return;
      const cleaned = text.trim();
      if (!cleaned) return;
      queueRef.current.push(cleaned);
      void drain();
    },
    [drain, enabled],
  );

  return {
    speak,
    prepare,
    phase,
    progress,
    ready,
    error,
    status,
    usingFallback,
    speaking,
    waitUntilIdle,
  };
}
