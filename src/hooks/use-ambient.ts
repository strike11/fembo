"use client";

import { useEffect, useRef } from "react";

export function useAmbient(enabled: boolean, scene: string) {
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled || (scene !== "rain" && scene !== "night" && scene !== "shower")) {
      ctxRef.current?.close().catch(() => undefined);
      ctxRef.current = null;
      return;
    }
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let index = 0; index < bufferSize; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (scene === "night" ? 0.06 : 0.18);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = scene === "night" ? 400 : scene === "shower" ? 2400 : 1800;
    const gain = ctx.createGain();
    gain.gain.value = scene === "night" ? 0.05 : scene === "shower" ? 0.1 : 0.12;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    void ctx.resume();
    source.start();
    return () => {
      source.stop();
      void ctx.close();
      ctxRef.current = null;
    };
  }, [enabled, scene]);
}
