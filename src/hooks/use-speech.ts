"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { transcribeUtterance, type WhisperStatus } from "@/lib/browser-whisper";

export type SpeechEngineStatus = WhisperStatus | null;

function canCaptureAudio() {
  return typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
}

const subscribeToAudioSupport = () => () => {};

function mergeChunks(chunks: Float32Array[]) {
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const merged = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}

function rms(frame: Float32Array) {
  let sum = 0;
  for (let index = 0; index < frame.length; index += 1) {
    const sample = frame[index] ?? 0;
    sum += sample * sample;
  }
  return Math.sqrt(sum / Math.max(1, frame.length));
}

export function useSpeech(onFinal: (text: string) => void) {
  const onFinalRef = useRef(onFinal);
  const wantedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const pcmRef = useRef<{
    ctx: AudioContext;
    processor: ScriptProcessorNode;
    chunks: Float32Array[];
    sampleRate: number;
    voiced: boolean;
    speechMs: number;
    silenceMs: number;
  } | null>(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [micReady, setMicReady] = useState(false);
  const supported = useSyncExternalStore(
    subscribeToAudioSupport,
    canCaptureAudio,
    () => false,
  );
  const [engineStatus, setEngineStatus] = useState<SpeechEngineStatus>(null);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  const stopPcm = useCallback(() => {
    const session = pcmRef.current;
    pcmRef.current = null;
    if (!session) return null;
    session.processor.onaudioprocess = null;
    try {
      session.processor.disconnect();
    } catch {
      // already closed
    }
    void session.ctx.close().catch(() => undefined);
    if (session.chunks.length === 0 || session.speechMs < 220) return null;
    return { samples: mergeChunks(session.chunks), sampleRate: session.sampleRate };
  }, []);

  const requestMic = useCallback(async () => {
    if (!canCaptureAudio()) {
      setError("This browser cannot open a microphone.");
      return false;
    }
    if (streamRef.current?.active) {
      setMicReady(true);
      setError(null);
      return true;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      });
      streamRef.current = stream;
      setMicReady(true);
      setError(null);
      return true;
    } catch {
      streamRef.current = null;
      setMicReady(false);
      setError("Allow the microphone in the browser bar, then tap the mic.");
      return false;
    }
  }, []);

  const finishUtterance = useCallback(async (samples: Float32Array, sampleRate: number) => {
    setListening(false);
    setInterim("Transcribing…");
    try {
      const text = await transcribeUtterance(samples, sampleRate, (status, progress) => {
        setEngineStatus(status);
        if (status === "downloading") {
          setInterim(
            progress != null
              ? `Loading speech engine ${progress}%`
              : "Loading speech engine (once)…",
          );
        } else if (status === "transcribing") {
          setInterim("Transcribing…");
        }
      });
      setEngineStatus(null);
      setInterim("");
      if (text) onFinalRef.current(text);
    } catch {
      setEngineStatus(null);
      setInterim("");
      setError("Could not transcribe that. Type it below.");
    }
  }, []);

  const beginPcm = useCallback(async () => {
    if (!wantedRef.current || pcmRef.current) return;
    const allowed = streamRef.current?.active || (await requestMic());
    const stream = streamRef.current;
    if (!allowed || !stream || !wantedRef.current) return;
    const ctx = new AudioContext();
    await ctx.resume();
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    const mute = ctx.createGain();
    mute.gain.value = 0;
    const session = {
      ctx,
      processor,
      chunks: [] as Float32Array[],
      sampleRate: ctx.sampleRate,
      voiced: false,
      speechMs: 0,
      silenceMs: 0,
    };
    pcmRef.current = session;
    processor.onaudioprocess = (event) => {
      if (!wantedRef.current || pcmRef.current !== session) return;
      const input = event.inputBuffer.getChannelData(0);
      const frame = new Float32Array(input);
      session.chunks.push(frame);
      const level = rms(frame);
      const dt = (frame.length / session.sampleRate) * 1000;
      if (level > 0.014) {
        session.voiced = true;
        session.speechMs += dt;
        session.silenceMs = 0;
        setInterim("Listening…");
      } else if (session.voiced) {
        session.silenceMs += dt;
      }
      const tooLong = session.speechMs + session.silenceMs > 14_000;
      const ended = session.voiced && session.silenceMs > 850 && session.speechMs > 220;
      if (!ended && !tooLong) return;
      wantedRef.current = false;
      const captured = stopPcm();
      setListening(false);
      if (captured) void finishUtterance(captured.samples, captured.sampleRate);
    };
    source.connect(processor);
    processor.connect(mute);
    mute.connect(ctx.destination);
    setListening(true);
    setError(null);
    setInterim("Listening… speak, then pause");
  }, [finishUtterance, requestMic, stopPcm]);

  const stop = useCallback(
    (opts?: { flush?: boolean }) => {
      wantedRef.current = false;
      const captured = stopPcm();
      setListening(false);
      setInterim("");
      setEngineStatus(null);
      if (opts?.flush && captured) {
        void finishUtterance(captured.samples, captured.sampleRate);
      }
    },
    [finishUtterance, stopPcm],
  );

  const start = useCallback(() => {
    wantedRef.current = true;
    void beginPcm().catch(() => {
      setError("Could not open the microphone. Type below instead.");
      wantedRef.current = false;
      setListening(false);
    });
  }, [beginPcm]);

  const toggle = useCallback(() => {
    if (wantedRef.current || listening) stop({ flush: true });
    else start();
  }, [listening, start, stop]);

  useEffect(() => {
    return () => {
      wantedRef.current = false;
      stopPcm();
      for (const track of streamRef.current?.getTracks() ?? []) track.stop();
      streamRef.current = null;
    };
  }, [stopPcm]);

  return {
    supported,
    listening,
    interim,
    start,
    toggle,
    stop,
    error,
    micReady,
    requestMic,
    engineStatus,
  };
}
