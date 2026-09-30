"use client";

import {
  MicIcon,
  MicOffIcon,
  PhoneOffIcon,
  Volume2Icon,
  VolumeXIcon,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RoomModes } from "@/components/room-modes";
import { RoleplayText } from "@/components/roleplay-text";
import { WaveBars } from "@/components/wave-bars";
import { Button } from "@/components/ui/button";
import { usePiper } from "@/hooks/use-piper";
import { useSpeech } from "@/hooks/use-speech";
import { warmupSpeechEngine } from "@/lib/browser-whisper";
import { fetchBillingStatus, type BillingStatus } from "@/lib/billing-client";
import { stripEmotionMarkup } from "@/lib/emotions";
import { formatDuration } from "@/lib/format";
import { pullSentences } from "@/lib/sentences";
import { lastAssistantSprite } from "@/lib/sprites";
import { readSseDeltaStream } from "@/lib/sse";
import { cn } from "@/lib/utils";

type Line = { id: string; role: "user" | "assistant"; content: string };

function commonPrefix(left: string, right: string) {
  const max = Math.min(left.length, right.length);
  let index = 0;
  while (index < max && left[index] === right[index]) index += 1;
  return left.slice(0, index);
}

export function CallRoom({
  slug,
  nickname,
  avatarPath,
  voiceId,
  autoListen,
}: {
  slug: string;
  nickname: string;
  avatarPath: string;
  voiceId: string;
  autoListen: boolean;
  locale?: string;
}) {
  const router = useRouter();
  const [callId, setCallId] = useState<string | null>(null);
  const [status, setStatus] = useState("Connecting…");
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [typed, setTyped] = useState("");
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const spokenCommittedRef = useRef("");
  const endingRef = useRef(false);
  const callIdRef = useRef<string | null>(null);
  const pendingRef = useRef(false);
  const { speak, prepare, phase, speaking, waitUntilIdle } = usePiper(voiceId, speakerOn);

  const sendTurnRef = useRef<(text: string, greet?: boolean) => Promise<void>>(async () => {});

  const { supported, listening, interim, start, stop, toggle, error: speechError, requestMic, engineStatus } =
    useSpeech((text) => {
      void sendTurnRef.current(text);
    });

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    void fetchBillingStatus().then(setBilling).catch(() => undefined);
  }, []);

  function emitSpeech(full: string, final = false) {
    const spoken = stripEmotionMarkup(full);
    let committed = spokenCommittedRef.current;
    if (!spoken.startsWith(committed)) {
      committed = commonPrefix(committed, spoken);
    }
    const unread = spoken.slice(committed.length);
    if (final) {
      const leftover = unread.trim();
      if (leftover) speak(leftover);
      spokenCommittedRef.current = spoken;
      return;
    }
    const { sentences, rest } = pullSentences(unread);
    for (const sentence of sentences) {
      const clean = stripEmotionMarkup(sentence);
      if (clean) speak(clean);
    }
    spokenCommittedRef.current = spoken.slice(0, spoken.length - rest.length);
  }

  async function sendTurn(text: string, greet = false) {
    const activeCallId = callIdRef.current;
    if (!activeCallId || pendingRef.current || endingRef.current) return;
    const content = text.trim();
    if (!greet && !content) return;
    if (content && billing && !billing.plus && billing.remaining === 0) {
      setError(billing.retryAt ? `Daily limit. Come back later. Plus removes the cap.` : "Daily limit reached");
      return;
    }
    stop();
    pendingRef.current = true;
    setPending(true);
    setError(null);
    spokenCommittedRef.current = "";
    if (content) {
      setLines((current) => [
        ...current,
        { id: `user-${Date.now()}`, role: "user", content },
      ]);
    }
    const assistantId = `assistant-${Date.now()}`;
    setLines((current) => [...current, { id: assistantId, role: "assistant", content: "" }]);
    try {
      const response = await fetch("/api/call/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, callId: activeCallId, content, greet }),
      });
      const full = await readSseDeltaStream(response, (next) => {
        emitSpeech(next);
        setLines((current) =>
          current.map((line) => (line.id === assistantId ? { ...line, content: next } : line)),
        );
      });
      emitSpeech(full, true);
      if (content) {
        setBilling((current) => {
          if (!current || current.plus || current.remaining === null) return current;
          return { ...current, remaining: Math.max(0, current.remaining - 1), used: current.used + 1 };
        });
      }
      if (speakerOn) {
        await Promise.race([
          waitUntilIdle(),
          new Promise<void>((resolve) => window.setTimeout(resolve, 12_000)),
        ]);
      }
      if (!muted && supported && !endingRef.current && (autoListen || greet)) {
        setStatus(`${nickname} is listening`);
        start();
      } else {
        setStatus("On a call");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "The call dropped for a moment");
      void fetchBillingStatus().then(setBilling).catch(() => undefined);
      setLines((current) =>
        current.filter((line) => line.id !== assistantId || line.content.length > 0),
      );
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  useEffect(() => {
    sendTurnRef.current = sendTurn;
  });

  async function hangUp() {
    if (endingRef.current) return;
    endingRef.current = true;
    stop();
    const summary = lines
      .filter((line) => line.role === "assistant" && line.content)
      .at(-1)?.content;
    if (callId) {
      await fetch(`/api/call/${callId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: stripEmotionMarkup(summary ?? "") }),
      }).catch(() => undefined);
    }
    router.push("/app/calls");
  }

  useEffect(() => {
    void requestMic();
    const timer = window.setTimeout(() => warmupSpeechEngine(), 400);
    return () => window.clearTimeout(timer);
  }, [requestMic]);

  useEffect(() => {
    let cancelled = false;
    async function connect() {
      try {
        await Promise.all([prepare(), requestMic()]);
        const response = await fetch("/api/call", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        const payload = (await response.json()) as {
          callId?: string;
          error?: string;
          history?: Array<{ id: string; role: "user" | "assistant"; content: string }>;
        };
        if (!response.ok || !payload.callId) {
          throw new Error(payload.error ?? "Could not start the call");
        }
        if (cancelled) return;
        callIdRef.current = payload.callId;
        setCallId(payload.callId);
        if (payload.history?.length) {
          setLines(
            payload.history.map((line) => ({
              id: line.id,
              role: line.role,
              content: line.content,
            })),
          );
        }
        setStatus("Connected");
        await sendTurnRef.current("", true);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not place the call");
          setStatus("Call failed");
        }
      }
    }
    void connect();
    return () => {
      cancelled = true;
    };
    // start once per room
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return (
    <div className="call-room relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="call-room-glow" />
      <header className="relative z-10 flex items-center justify-between px-5 py-4">
        <RoomModes slug={slug} active="call" />
        <div className="text-center">
          <p className="text-xs tracking-[0.2em] text-primary-foreground/70 uppercase">Live call</p>
          <p className="font-mono text-sm text-primary-foreground">{formatDuration(seconds)}</p>
        </div>
        <p className="text-sm text-primary-foreground/70">{status}</p>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-6">
        <div className={cn("call-avatar", (listening || speaking || pending) && "call-avatar-live")}>
          <Image
            src={lastAssistantSprite(lines, slug, avatarPath)}
            alt=""
            width={220}
            height={220}
            className="size-44 rounded-full object-cover sm:size-52"
          />
        </div>
        <div className="text-center">
          <h1 className="font-heading text-3xl font-semibold text-primary-foreground">{nickname}</h1>
          <p className="mt-1 text-sm text-primary-foreground/70">
            {listening ? "Listening…" : speaking ? "Speaking…" : pending ? "Thinking…" : "On the line"}
          </p>
        </div>
        <WaveBars active={listening || speaking || pending} className="h-10 [&_span]:bg-primary-foreground/80" />
        {interim ? (
          <p className="max-w-md text-center text-sm text-primary-foreground/80">{interim}</p>
        ) : !listening && !pending && !speaking ? (
          <p className="max-w-md text-center text-sm text-primary-foreground/60">
            {supported
              ? "Tap the mic, allow it, speak, then pause — or tap again to send. Typing works too."
              : "Allow the microphone, or type below."}
          </p>
        ) : null}
        {engineStatus === "downloading" ? (
          <p className="text-sm text-primary-foreground/70">First-time speech engine download…</p>
        ) : null}
        {error ? <p className="text-sm text-red-200">{error}</p> : null}
        {speechError ? <p className="text-sm text-red-200">{speechError}</p> : null}
        {phase === "downloading" ? (
          <p className="text-sm text-primary-foreground/70">Preparing voice…</p>
        ) : null}
      </div>

      <div className="relative z-10 mx-auto mb-4 max-h-36 w-full max-w-xl overflow-y-auto px-5">
        <div className="flex flex-col gap-2">
          {lines
            .filter((line) => line.content)
            .slice(-4)
            .map((line) => (
              <div
                key={line.id}
                className={cn(
                  "rounded-2xl px-3 py-2 text-sm",
                  line.role === "user"
                    ? "self-end bg-primary-foreground/15 text-primary-foreground"
                    : "self-start bg-background/10 text-primary-foreground",
                )}
              >
                <RoleplayText content={line.content} tone={line.role} onDark />
              </div>
            ))}
        </div>
      </div>

      <form
        className="relative z-10 mx-auto mb-4 flex w-full max-w-xl gap-2 px-5"
        onSubmit={(event) => {
          event.preventDefault();
          const text = typed.trim();
          if (!text) return;
          setTyped("");
          void sendTurn(text);
        }}
      >
        <input
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder={listening ? "Listening…" : "Type if the mic is quiet"}
          className="h-11 min-w-0 flex-1 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 text-sm text-primary-foreground placeholder:text-primary-foreground/45 outline-none focus:border-primary-foreground/45"
        />
        <Button type="submit" variant="secondary" disabled={pending || !typed.trim()}>
          Send
        </Button>
      </form>

      <div className="relative z-10 flex items-center justify-center gap-4 pb-10">
        <Button
          type="button"
          variant={listening ? "default" : "secondary"}
          size="icon-lg"
          aria-label={listening ? "Stop listening" : "Start listening"}
          onClick={() => {
            if (listening) {
              setStatus("Transcribing…");
              toggle();
              return;
            }
            setMuted(false);
            setStatus(`${nickname} is listening`);
            start();
          }}
        >
          {listening ? <MicIcon /> : <MicOffIcon />}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon-lg"
          className="size-16 rounded-full"
          aria-label="Hang up"
          onClick={() => void hangUp()}
        >
          <PhoneOffIcon />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon-lg"
          aria-label={speakerOn ? "Mute speaker" : "Unmute speaker"}
          onClick={() => setSpeakerOn((value) => !value)}
        >
          {speakerOn ? <Volume2Icon /> : <VolumeXIcon />}
        </Button>
      </div>
    </div>
  );
}
